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

    // Ambil absensi makan dan asrama dalam range
    const [absensiMakan, absensiAsrama] = await Promise.all([
      prisma.absensi.findMany({
        where: { tipe: "MAKAN", tanggal: { gte: dariUTC, lte: sampaiUTC } },
      }),
      prisma.absensi.findMany({
        where: { tipe: "ASRAMA", tanggal: { gte: dariUTC, lte: sampaiUTC } },
      }),
    ]);

    const idsMakan = absensiMakan.map((a) => a.id);
    const idsAsrama = absensiAsrama.map((a) => a.id);

    const santriList = await prisma.santri.findMany({
      orderBy: { nama: "asc" },
    });

    const hasil = await Promise.all(
      santriList.map(async (santri) => {
        const [makan, asrama] = await Promise.all([
          prisma.absenMakan.findMany({
            where: {
              santriId: santri.id,
              absensiId: { in: idsMakan },
              status: { not: "KOSONG" },
            },
          }),
          prisma.absenAsrama.findMany({
            where: {
              santriId: santri.id,
              absensiId: { in: idsAsrama },
              status: { not: "KOSONG" },
            },
          }),
        ]);

        // Rekap makan
        const semua = [...makan, ...asrama];
        const rekapMakan = {
          hadir: makan.filter((a) => a.status === "HADIR").length,
          telat: makan.filter((a) => a.status === "TELAT").length,
          alpa: makan.filter((a) => a.status === "ALPA").length,
          sakit: makan.filter((a) => a.status === "SAKIT").length,
          izin: makan.filter((a) => a.status === "IZIN").length,
        };

        // Rekap asrama
        const rekapAsrama = {
          hadir: asrama.filter((a) => a.status === "HADIR").length,
          telat: asrama.filter((a) => a.status === "TELAT").length,
          alpa: asrama.filter((a) => a.status === "ALPA").length,
          sakit: asrama.filter((a) => a.status === "SAKIT").length,
          izin: asrama.filter((a) => a.status === "IZIN").length,
        };

        // Rekap gabungan
        const gabungan = {
          hadir: rekapMakan.hadir + rekapAsrama.hadir,
          telat: rekapMakan.telat + rekapAsrama.telat,
          alpa: rekapMakan.alpa + rekapAsrama.alpa,
          sakit: rekapMakan.sakit + rekapAsrama.sakit,
          izin: rekapMakan.izin + rekapAsrama.izin,
        };
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
          makan: {
            ...rekapMakan,
            skor: hitungSkor(
              rekapMakan.hadir,
              rekapMakan.telat,
              rekapMakan.alpa,
            ),
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
      }),
    );

    // Summary keseluruhan
    const summaryMakan = {
      hadir: hasil.reduce((a, b) => a + b.makan.hadir, 0),
      telat: hasil.reduce((a, b) => a + b.makan.telat, 0),
      alpa: hasil.reduce((a, b) => a + b.makan.alpa, 0),
    };
    const summaryAsrama = {
      hadir: hasil.reduce((a, b) => a + b.asrama.hadir, 0),
      telat: hasil.reduce((a, b) => a + b.asrama.telat, 0),
      alpa: hasil.reduce((a, b) => a + b.asrama.alpa, 0),
    };
    const summaryGabungan = {
      hadir: summaryMakan.hadir + summaryAsrama.hadir,
      telat: summaryMakan.telat + summaryAsrama.telat,
      alpa: summaryMakan.alpa + summaryAsrama.alpa,
    };

    return NextResponse.json({
      santri: hasil,
      summary: {
        makan: {
          ...summaryMakan,
          skor: hitungSkor(
            summaryMakan.hadir,
            summaryMakan.telat,
            summaryMakan.alpa,
          ),
        },
        asrama: {
          ...summaryAsrama,
          skor: hitungSkor(
            summaryAsrama.hadir,
            summaryAsrama.telat,
            summaryAsrama.alpa,
          ),
        },
        gabungan: {
          ...summaryGabungan,
          skor: hitungSkor(
            summaryGabungan.hadir,
            summaryGabungan.telat,
            summaryGabungan.alpa,
          ),
        },
      },
    });
  } catch (error) {
    console.error("GET rekap-piket error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
