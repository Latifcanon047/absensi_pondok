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

    // Ambil semua data sekaligus — SATU query per tipe
    const [absensiSholat, absensiKelas, santriList] = await Promise.all([
      prisma.absensi.findMany({
        where: { tipe: "SHOLAT", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.absensi.findMany({
        where: { tipe: "KELAS", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.santri.findMany({ orderBy: { nama: "asc" } }),
    ]);

    const idsSholat = absensiSholat.map((a) => a.id);
    const idsKelas = absensiKelas.map((a) => a.id);

    // Ambil semua absen sekaligus — bukan per santri
    const [semuaSholat, semuaKelas] = await Promise.all([
      prisma.absenSholat.findMany({
        where: {
          absensiId: { in: idsSholat },
          status: { not: "KOSONG" },
        },
      }),
      prisma.absenKelas.findMany({
        where: {
          absensiId: { in: idsKelas },
          status: { not: "KOSONG" },
        },
      }),
    ]);

    // Hitung per santri di memory — tidak perlu query lagi
    const hasil = santriList.map((santri) => {
      const sholat = semuaSholat.filter((a) => a.santriId === santri.id);
      const kelas = semuaKelas.filter((a) => a.santriId === santri.id);

      const rekapSholat = {
        hadir: sholat.filter((a) => a.status === "HADIR").length,
        telat: sholat.filter((a) => a.status === "TELAT").length,
        alpa: sholat.filter((a) => a.status === "ALPA").length,
        izin: sholat.filter((a) => a.status === "IZIN").length,
        sakit: sholat.filter((a) => a.status === "SAKIT").length,
      };

      const rekapKelas = {
        hadir: kelas.filter((a) => a.status === "HADIR").length,
        telat: kelas.filter((a) => a.status === "TELAT").length,
        alpa: kelas.filter((a) => a.status === "ALPA").length,
        izin: kelas.filter((a) => a.status === "IZIN").length,
        sakit: kelas.filter((a) => a.status === "SAKIT").length,
      };

      const gabungan = {
        hadir: rekapSholat.hadir + rekapKelas.hadir,
        telat: rekapSholat.telat + rekapKelas.telat,
        alpa: rekapSholat.alpa + rekapKelas.alpa,
        izin: rekapSholat.izin + rekapKelas.izin,
        sakit: rekapSholat.sakit + rekapKelas.sakit,
      };

      return {
        id: santri.id,
        nama: santri.nama,
        isArchived: santri.isArchived,
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
          skor: hitungSkor(rekapKelas.hadir, rekapKelas.telat, rekapKelas.alpa),
        },
        gabungan: {
          ...gabungan,
          skor: hitungSkor(gabungan.hadir, gabungan.telat, gabungan.alpa),
        },
      };
    });

    // Summary keseluruhan
    const summarySholat = {
      hadir: semuaSholat.filter((a) => a.status === "HADIR").length,
      telat: semuaSholat.filter((a) => a.status === "TELAT").length,
      alpa: semuaSholat.filter((a) => a.status === "ALPA").length,
      izin: semuaSholat.filter((a) => a.status === "IZIN").length,
      sakit: semuaSholat.filter((a) => a.status === "SAKIT").length,
    };
    const summaryKelas = {
      hadir: semuaKelas.filter((a) => a.status === "HADIR").length,
      telat: semuaKelas.filter((a) => a.status === "TELAT").length,
      alpa: semuaKelas.filter((a) => a.status === "ALPA").length,
      izin: semuaKelas.filter((a) => a.status === "IZIN").length,
      sakit: semuaKelas.filter((a) => a.status === "SAKIT").length,
    };
    const summaryGabungan = {
      hadir: summarySholat.hadir + summaryKelas.hadir,
      telat: summarySholat.telat + summaryKelas.telat,
      alpa: summarySholat.alpa + summaryKelas.alpa,
      izin: summarySholat.izin + summaryKelas.izin,
      sakit: summarySholat.sakit + summaryKelas.sakit,
    };

    return NextResponse.json({
      santri: hasil,
      summary: summaryGabungan,
    });
  } catch (error) {
    console.error("GET rekap error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data rekap" },
      { status: 500 },
    );
  }
}
