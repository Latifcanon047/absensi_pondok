import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalSantri, totalAbsensiSholat, totalAbsensiKelas] =
      await Promise.all([
        prisma.santri.count({ where: { isArchived: false } }),
        prisma.absensi.count({ where: { tipe: "SHOLAT" } }),
        prisma.absensi.count({ where: { tipe: "KELAS" } }),
      ]);

    return NextResponse.json({
      totalSantri,
      totalAbsensiSholat,
      totalAbsensiKelas,
    });
  } catch (error) {
    console.error("GET dashboard error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
