import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Ambil semua data sekaligus
    const [
      absensiSholat,
      absensiKelas,
      absensiMakan,
      absensiAsrama,
      santriList,
    ] = await Promise.all([
      prisma.absensi.findMany({
        where: { tipe: "SHOLAT", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.absensi.findMany({
        where: { tipe: "KELAS", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.absensi.findMany({
        where: { tipe: "MAKAN", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.absensi.findMany({
        where: { tipe: "ASRAMA", tanggal: { gte: dariUTC, lt: sampaiUTC } },
      }),
      prisma.santri.findMany({
        orderBy: { nama: "asc" },
        where: { isArchived: false },
      }),
    ]);

    // Buat variabel untuk ID absensi masing-masing tipe
    const idSholat = absensiSholat.map((a) => a.id);
    const idKelas = absensiKelas.map((a) => a.id);
    const idMakan = absensiMakan.map((a) => a.id);
    const idAsrama = absensiAsrama.map((a) => a.id);

    // Ambil semua data absen dari masing-masing tipe dengan relasi absensi untuk tanggal
    const [semuaSholat, semuaKelas, semuaMakan, semuaAsrama] =
      await Promise.all([
        prisma.absenSholat.findMany({
          where: {
            absensiId: { in: idSholat },
          },
          include: {
            absensi: true,
          },
        }),
        prisma.absenKelas.findMany({
          where: {
            absensiId: { in: idKelas },
          },
          include: {
            absensi: true,
          },
        }),
        prisma.absenMakan.findMany({
          where: {
            absensiId: { in: idMakan },
          },
          include: {
            absensi: true,
          },
        }),
        prisma.absenAsrama.findMany({
          where: {
            absensiId: { in: idAsrama },
          },
          include: {
            absensi: true,
          },
        }),
      ]);

    // Filter response hanya santri yang aktif dengan tanggal
    const hasil = santriList.map((santri) => ({
      id: santri.id,
      nama: santri.nama,
      sholat: semuaSholat
        .filter((a) => a.santriId === santri.id)
        .map((a) => ({
          ...a,
          tanggal: a.absensi?.tanggal?.toISOString().split("T")[0],
        })),
      kelas: semuaKelas
        .filter((a) => a.santriId === santri.id)
        .map((a) => ({
          ...a,
          tanggal: a.absensi?.tanggal?.toISOString().split("T")[0],
        })),
      makan: semuaMakan
        .filter((a) => a.santriId === santri.id)
        .map((a) => ({
          ...a,
          tanggal: a.absensi?.tanggal?.toISOString().split("T")[0],
        })),
      asrama: semuaAsrama
        .filter((a) => a.santriId === santri.id)
        .map((a) => ({
          ...a,
          tanggal: a.absensi?.tanggal?.toISOString().split("T")[0],
        })),
    }));

    return NextResponse.json({
      santri: hasil,
    });
  } catch (error) {
    console.error("GET data-absen error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data absen" },
      { status: 500 },
    );
  }
}
