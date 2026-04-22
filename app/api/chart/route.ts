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

    // Ambil semua data sholat + kelas
    const [semuaSholat, semuaKelas] = await Promise.all([
      prisma.absenSholat.findMany({ where: { absensi: absensiWhere } }),
      prisma.absenKelas.findMany({ where: { absensi: absensiWhere } }),
    ]);

    const semua = [...semuaSholat, ...semuaKelas];

    // Hitung agregat per hari
    const HARI = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];

    const chartData = HARI.map((hari) => {
      const filtered = semua.filter((a) => a.hari === hari);
      return {
        hari,
        hadir: filtered.filter((a) => a.status === "HADIR").length,
        telat: filtered.filter((a) => a.status === "TELAT").length,
        sakit: filtered.filter((a) => a.status === "SAKIT").length,
        izin: filtered.filter((a) => a.status === "IZIN").length,
        alpa: filtered.filter((a) => a.status === "ALPA").length,
      };
    });

    // Hitung summary keseluruhan
    const hadir = semua.filter((a) => a.status === "HADIR").length;
    const telat = semua.filter((a) => a.status === "TELAT").length;
    const sakit = semua.filter((a) => a.status === "SAKIT").length;
    const izin = semua.filter((a) => a.status === "IZIN").length;
    const alpa = semua.filter((a) => a.status === "ALPA").length;

    const summary = {
      hadir,
      telat,
      sakit,
      izin,
      alpa,
      skor: hitungSkor(hadir, telat, alpa),
    };

    return NextResponse.json({ chartData, summary });
  } catch (error) {
    console.error("GET chart error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data chart" },
      { status: 500 },
    );
  }
}
