import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tanggal: string }> },
) {
  try {
    const { tanggal } = await params;
    const tanggalDate = new Date(tanggal);
    const tanggalAkhir = new Date(tanggal);
    tanggalAkhir.setHours(23, 59, 59);

    // Ambil semua absensi di tanggal ini (4 tipe)
    const absensiList = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: tanggalDate,
          lte: tanggalAkhir,
        },
      },
    });

    // Kelompokkan per tipe
    const result = {
      SHOLAT: absensiList.find((a) => a.tipe === "SHOLAT") || null,
      KELAS: absensiList.find((a) => a.tipe === "KELAS") || null,
      MAKAN: absensiList.find((a) => a.tipe === "MAKAN") || null,
      ASRAMA: absensiList.find((a) => a.tipe === "ASRAMA") || null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET absensi by tanggal error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
