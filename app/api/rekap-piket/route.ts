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
    const [absensiMakan, absensiAsrama, santriList] = await Promise.all([
      prisma.absensi.findMany({
        where: { tipe: "MAKAN", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.absensi.findMany({
        where: { tipe: "ASRAMA", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.santri.findMany({ orderBy: { nama: "asc" } }),
    ]);

    const idsMakan = absensiMakan.map((a) => a.id);
    const idsAsrama = absensiAsrama.map((a) => a.id);

    // Ambil semua absen sekaligus — bukan per santri
    const [semuaMakan, semuaAsrama] = await Promise.all([
      prisma.absenMakan.findMany({
        where: {
          absensiId: { in: idsMakan },
          status: { not: "KOSONG" },
        },
      }),
      prisma.absenAsrama.findMany({
        where: {
          absensiId: { in: idsAsrama },
          status: { not: "KOSONG" },
        },
      }),
    ]);

    // Hitung per santri di memory — tidak perlu query lagi
    const hasil = santriList.map((santri) => {
      const makan = semuaMakan.filter((a) => a.santriId === santri.id);
      const asrama = semuaAsrama.filter((a) => a.santriId === santri.id);

      const rekapMakan = {
        hadir: makan.filter((a) => a.status === "HADIR").length,
        telat: makan.filter((a) => a.status === "TELAT").length,
        alpa: makan.filter((a) => a.status === "ALPA").length,
        izin: makan.filter((a) => a.status === "IZIN").length,
        sakit: makan.filter((a) => a.status === "SAKIT").length,
      };

      const rekapAsrama = {
        hadir: asrama.filter((a) => a.status === "HADIR").length,
        telat: asrama.filter((a) => a.status === "TELAT").length,
        alpa: asrama.filter((a) => a.status === "ALPA").length,
        izin: asrama.filter((a) => a.status === "IZIN").length,
        sakit: asrama.filter((a) => a.status === "SAKIT").length,
      };

      const gabungan = {
        hadir: rekapMakan.hadir + rekapAsrama.hadir,
        telat: rekapMakan.telat + rekapAsrama.telat,
        alpa: rekapMakan.alpa + rekapAsrama.alpa,
        izin: rekapMakan.izin + rekapAsrama.izin,
        sakit: rekapMakan.sakit + rekapAsrama.sakit,
      };

      return {
        id: santri.id,
        nama: santri.nama,
        isArchived: santri.isArchived,
        makan: {
          ...rekapMakan,
          skor: hitungSkor(rekapMakan.hadir, rekapMakan.telat, rekapMakan.alpa),
        },
        asrama: {
          ...rekapAsrama,
          skor: hitungSkor(
            rekapAsrama.hadir,
            rekapAsrama.telat,
            rekapAsrama.alpa,
          ),
        },
        gabungan: {
          ...gabungan,
          skor: hitungSkor(gabungan.hadir, gabungan.telat, gabungan.alpa),
        },
      };
    });

    // Summary keseluruhan
    const summaryMakan = {
      hadir: semuaMakan.filter((a) => a.status === "HADIR").length,
      telat: semuaMakan.filter((a) => a.status === "TELAT").length,
      alpa: semuaMakan.filter((a) => a.status === "ALPA").length,
      izin: semuaMakan.filter((a) => a.status === "IZIN").length,
      sakit: semuaMakan.filter((a) => a.status === "SAKIT").length,
    };
    const summaryAsrama = {
      hadir: semuaAsrama.filter((a) => a.status === "HADIR").length,
      telat: semuaAsrama.filter((a) => a.status === "TELAT").length,
      alpa: semuaAsrama.filter((a) => a.status === "ALPA").length,
      izin: semuaAsrama.filter((a) => a.status === "IZIN").length,
      sakit: semuaAsrama.filter((a) => a.status === "SAKIT").length,
    };
    const summaryGabungan = {
      hadir: summaryMakan.hadir + summaryAsrama.hadir,
      telat: summaryMakan.telat + summaryAsrama.telat,
      alpa: summaryMakan.alpa + summaryAsrama.alpa,
      izin: summaryMakan.izin + summaryAsrama.izin,
      sakit: summaryMakan.sakit + summaryAsrama.sakit,
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
