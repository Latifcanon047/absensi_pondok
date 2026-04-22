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

    const data = await prisma.absenSholat.findMany({
      where: { absensiId },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET absen-sholat error:", error);
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
        (item: {
          santriId: number;
          hari: string;
          waktu: string;
          status: StatusAbsen;
        }) =>
          prisma.absenSholat.upsert({
            where: {
              absensiId_santriId_hari_waktu: {
                absensiId,
                santriId: item.santriId,
                hari: item.hari,
                waktu: item.waktu,
              },
            },
            update: { status: item.status },
            create: {
              absensiId,
              santriId: item.santriId,
              hari: item.hari,
              waktu: item.waktu,
              status: item.status,
            },
          }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST absen-sholat error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 },
    );
  }
}
