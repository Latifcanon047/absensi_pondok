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

    const data = await prisma.absenMakan.findMany({
      where: { absensiId },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET absen-makan error:", error);
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
      data.map(
        (item: { santriId: number; sesi: string; status: StatusAbsen }) =>
          prisma.absenMakan.upsert({
            where: {
              absensiId_santriId_sesi: {
                absensiId,
                santriId: item.santriId,
                sesi: item.sesi,
              },
            },
            update: { status: item.status },
            create: {
              absensiId,
              santriId: item.santriId,
              sesi: item.sesi,
              status: item.status,
            },
          }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST absen-makan error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 },
    );
  }
}
