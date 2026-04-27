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

    // Ambil semua absensi dalam range
    const [absensiSholat, absensiKelas, absensiMakan, absensiAsrama] =
      await Promise.all([
        prisma.absensi.findMany({
          where: { tipe: "SHOLAT", tanggal: { gte: dariUTC, lte: sampaiUTC } },
        }),
        prisma.absensi.findMany({
          where: { tipe: "KELAS", tanggal: { gte: dariUTC, lte: sampaiUTC } },
        }),
        prisma.absensi.findMany({
          where: { tipe: "MAKAN", tanggal: { gte: dariUTC, lte: sampaiUTC } },
        }),
        prisma.absensi.findMany({
          where: { tipe: "ASRAMA", tanggal: { gte: dariUTC, lte: sampaiUTC } },
        }),
      ]);

    const idsSholat = absensiSholat.map((a) => a.id);
    const idsKelas = absensiKelas.map((a) => a.id);
    const idsMakan = absensiMakan.map((a) => a.id);
    const idsAsrama = absensiAsrama.map((a) => a.id);

    const santriList = await prisma.santri.findMany({
      orderBy: { nama: "asc" },
    });

    const hasil = await Promise.all(
      santriList.map(async (santri) => {
        const [sholat, kelas, makan, asrama] = await Promise.all([
          prisma.absenSholat.findMany({
            where: {
              santriId: santri.id,
              absensiId: { in: idsSholat },
              status: { not: "KOSONG" },
            },
          }),
          prisma.absenKelas.findMany({
            where: {
              santriId: santri.id,
              absensiId: { in: idsKelas },
              status: { not: "KOSONG" },
            },
          }),
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

        // Gabungan sholat + kelas
        const semuaAbsen = [...sholat, ...kelas];
        const hadirAbsen = semuaAbsen.filter(
          (a) => a.status === "HADIR",
        ).length;
        const telatAbsen = semuaAbsen.filter(
          (a) => a.status === "TELAT",
        ).length;
        const alpaAbsen = semuaAbsen.filter((a) => a.status === "ALPA").length;
        const skorKedisiplinan = hitungSkor(hadirAbsen, telatAbsen, alpaAbsen);

        // Gabungan makan + asrama
        const semuaPiket = [...makan, ...asrama];
        const hadirPiket = semuaPiket.filter(
          (a) => a.status === "HADIR",
        ).length;
        const telatPiket = semuaPiket.filter(
          (a) => a.status === "TELAT",
        ).length;
        const alpaPiket = semuaPiket.filter((a) => a.status === "ALPA").length;
        const skorTanggungJawab = hitungSkor(hadirPiket, telatPiket, alpaPiket);

        // Skor final = rata-rata keduanya
        const skorFinal =
          Math.round(((skorKedisiplinan + skorTanggungJawab) / 2) * 10) / 10;

        return {
          id: santri.id,
          nama: santri.nama,
          skorKedisiplinan,
          skorTanggungJawab,
          skorFinal,
        };
      }),
    );

    // Urutkan skor final tertinggi
    const sorted = hasil.sort((a, b) => b.skorFinal - a.skorFinal);
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("GET leaderboard error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data leaderboard" },
      { status: 500 },
    );
  }
}
