import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hitungSkor } from "@/lib/utils";

export async function GET(request: NextRequest) {
  function toUTCDateString(date: Date) {
    return date.toISOString().split("T")[0];
  }
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

    const [semuaSholat, semuaKelas] = await Promise.all([
      prisma.absenSholat.findMany({
        where: {
          absensiId: { in: absensiIds },
          status: { not: "KOSONG" },
        },
        include: { absensi: true },
      }),
      prisma.absenKelas.findMany({
        where: {
          absensiId: { in: absensiIds },
          status: { not: "KOSONG" },
        },
        include: { absensi: true },
      }),
    ]);

    // Buat chart data per tanggal
    const chartData = absensiList
      .filter(
        (a, i, arr) =>
          arr.findIndex(
            (b) => toUTCDateString(b.tanggal) === toUTCDateString(a.tanggal),
          ) === i,
      )
      .map((absensi) => {
        const tanggal = new Date(absensi.tanggal);
        const label = `${tanggal.getDate()}/${tanggal.getMonth() + 1}`;

        const sholatHari = semuaSholat.filter(
          (s) =>
            toUTCDateString(s.absensi.tanggal) === toUTCDateString(tanggal),
        );
        const kelasHari = semuaKelas.filter(
          (k) =>
            toUTCDateString(k.absensi.tanggal) === toUTCDateString(tanggal),
        );
        const semua = [...sholatHari, ...kelasHari];

        return {
          label,
          hadir: semua.filter((a) => a.status === "HADIR").length,
          telat: semua.filter((a) => a.status === "TELAT").length,
          sakit: semua.filter((a) => a.status === "SAKIT").length,
          izin: semua.filter((a) => a.status === "IZIN").length,
          alpa: semua.filter((a) => a.status === "ALPA").length,
        };
      });

    // Summary keseluruhan
    const semua = [...semuaSholat, ...semuaKelas];
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
