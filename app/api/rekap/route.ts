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

    // Filter absensi
    const absensiWhere =
      mode === "bulan" ? { bulan, tahun } : { bulan, tahun, mingguKe };

    // Ambil semua santri (termasuk archived untuk data historis)
    const santriList = await prisma.santri.findMany({
      orderBy: { nama: "asc" },
    });

    // Hitung per santri
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

        return {
          id: santri.id,
          nama: santri.nama,
          isArchived: santri.isArchived,
          hadir: semua.filter((a) => a.status === "HADIR").length,
          telat: semua.filter((a) => a.status === "TELAT").length,
          sakit: semua.filter((a) => a.status === "SAKIT").length,
          izin: semua.filter((a) => a.status === "IZIN").length,
          alpa: semua.filter((a) => a.status === "ALPA").length,
          skor: hitungSkor(
            semua.filter((a) => a.status === "HADIR").length,
            semua.filter((a) => a.status === "TELAT").length,
            semua.filter((a) => a.status === "ALPA").length,
          ),
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
