import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusAbsen } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const absensiId = parseInt(searchParams.get("absensiId") || "0");

    if (!absensiId) {
      return NextResponse.json(
        { error: "absensiId harus diisi" },
        { status: 400 },
      );
    }

    const data = await prisma.absenAsrama.findMany({
      where: { absensiId },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET absen-asrama error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { absensiId, data } = await request.json();

    if (!absensiId || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    await prisma.$transaction(
      data.map((item: { santriId: number; status: StatusAbsen }) =>
        prisma.absenAsrama.upsert({
          where: {
            absensiId_santriId: {
              absensiId,
              santriId: item.santriId,
            },
          },
          update: { status: item.status },
          create: {
            absensiId,
            santriId: item.santriId,
            status: item.status,
          },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST absen-asrama error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 },
    );
  }
}
