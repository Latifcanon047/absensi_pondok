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
    const dariUTC = new Date(
      Date.UTC(dari.getFullYear(), dari.getMonth(), dari.getDate()),
    );

    const sampaiUTC = new Date(
      Date.UTC(sampai.getFullYear(), sampai.getMonth(), sampai.getDate() + 1),
    );

    const absensiList = await prisma.absensi.findMany({
      where: {
        tanggal: { gte: dariUTC, lt: sampaiUTC },
      },
    });

    const absensiIds = absensiList.map((a) => a.id);

    const santriList = await prisma.santri.findMany({
      orderBy: { nama: "asc" },
    });

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
        const alpa = semua.filter((a) => a.status === "ALPA").length;

        return {
          id: santri.id,
          nama: santri.nama,
          hadir,
          telat,
          alpa,
          skor: hitungSkor(hadir, telat, alpa),
        };
      }),
    );

    const sorted = hasil.sort((a, b) => b.skor - a.skor);
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("GET leaderboard error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data leaderboard" },
      { status: 500 },
    );
  }
}
