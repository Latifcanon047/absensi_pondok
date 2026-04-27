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
        const rekapSholat = {
          hadir: sholat.filter((a) => a.status === "HADIR").length,
          telat: sholat.filter((a) => a.status === "TELAT").length,
          alpa: sholat.filter((a) => a.status === "ALPA").length,
          sakit: sholat.filter((a) => a.status === "SAKIT").length,
          izin: sholat.filter((a) => a.status === "IZIN").length,
        };

        // Rekap asrama
        const rekapKelas = {
          hadir: kelas.filter((a) => a.status === "HADIR").length,
          telat: kelas.filter((a) => a.status === "TELAT").length,
          alpa: kelas.filter((a) => a.status === "ALPA").length,
          sakit: kelas.filter((a) => a.status === "SAKIT").length,
          izin: kelas.filter((a) => a.status === "IZIN").length,
        };

        // Rekap gabungan
        const gabungan = {
          hadir: rekapSholat.hadir + rekapKelas.hadir,
          telat: rekapSholat.telat + rekapKelas.telat,
          alpa: rekapSholat.alpa + rekapKelas.alpa,
          sakit: rekapSholat.sakit + rekapKelas.sakit,
          izin: rekapSholat.izin + rekapKelas.izin,
        };

        return {
          id: santri.id,
          nama: santri.nama,
          isArchived: santri.isArchived,
          hadir,
          telat,
          sakit,
          izin,
          alpa,
          sholat: {
            ...rekapSholat,
            skor: hitungSkor(
              rekapSholat.hadir,
              rekapSholat.telat,
              rekapSholat.alpa,
            ),
          },
          kelas: {
            ...rekapKelas,
            skor: hitungSkor(
              rekapKelas.hadir,
              rekapKelas.telat,
              rekapKelas.alpa,
            ),
          },
          gabungan: {
            ...gabungan,
            skor: hitungSkor(gabungan.hadir, gabungan.telat, gabungan.alpa),
          },
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
