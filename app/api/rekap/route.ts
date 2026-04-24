import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hitungSkor } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dariTanggal = searchParams.get("dariTanggal");
    const sampaiTanggal = searchParams.get("sampaiTanggal");

    if (!dariTanggal || !sampaiTanggal) {
      return NextResponse.json(
        { error: "dariTanggal dan sampaiTanggal harus diisi" },
        { status: 400 },
      );
    }

    const dari = new Date(dariTanggal);
    const sampai = new Date(sampaiTanggal);
    sampai.setHours(23, 59, 59);

    // Ambil absensi dalam range tanggal
    const absensiList = await prisma.absensi.findMany({
      where: {
        tanggal: { gte: dari, lte: sampai },
      },
    });

    const absensiIds = absensiList.map((a) => a.id);

    // Ambil semua santri
    const santriList = await prisma.santri.findMany({
      orderBy: { nama: "asc" },
    });

    // Hitung per santri
    const hasil = await Promise.all(
      santriList.map(async (santri) => {
        const [sholat, kelas] = await Promise.all([
          prisma.absenSholat.findMany({
            where: {
              santriId: santri.id,
              absensiId: { in: absensiIds },
              status: { not: "KOSONG" },
            },
          }),
          prisma.absenKelas.findMany({
            where: {
              santriId: santri.id,
              absensiId: { in: absensiIds },
              status: { not: "KOSONG" },
            },
          }),
        ]);

        const semua = [...sholat, ...kelas];
        const hadir = semua.filter((a) => a.status === "HADIR").length;
        const telat = semua.filter((a) => a.status === "TELAT").length;
        const sakit = semua.filter((a) => a.status === "SAKIT").length;
        const izin = semua.filter((a) => a.status === "IZIN").length;
        const alpa = semua.filter((a) => a.status === "ALPA").length;

        return {
          id: santri.id,
          nama: santri.nama,
          isArchived: santri.isArchived,
          hadir,
          telat,
          sakit,
          izin,
          alpa,
          skor: hitungSkor(hadir, telat, alpa),
        };
      }),
    );

    return NextResponse.json(hasil);
  } catch (error) {
    console.error("GET rekap error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data rekap" },
      { status: 500 },
    );
  }
}
