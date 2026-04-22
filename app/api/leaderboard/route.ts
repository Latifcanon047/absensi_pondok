import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hitungSkor } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "bulan";
    const bulan = parseInt(
      searchParams.get("bulan") || String(new Date().getMonth() + 1),
    );
    const tahun = parseInt(
      searchParams.get("tahun") || String(new Date().getFullYear()),
    );
    const mingguKe = parseInt(searchParams.get("mingguKe") || "1");

    const absensiWhere =
      mode === "bulan" ? { bulan, tahun } : { bulan, tahun, mingguKe };

    const santriList = await prisma.santri.findMany({
      orderBy: { nama: "asc" },
    });

    const hasil = await Promise.all(
      santriList.map(async (santri) => {
        const [sholat, kelas] = await Promise.all([
          prisma.absenSholat.findMany({
            where: { santriId: santri.id, absensi: absensiWhere },
          }),
          prisma.absenKelas.findMany({
            where: { santriId: santri.id, absensi: absensiWhere },
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

    // Urutkan skor tertinggi ke terendah
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
