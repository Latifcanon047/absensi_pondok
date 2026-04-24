import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipeAbsensi } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = parseInt(searchParams.get("bulan") || "0");
    const tahun = parseInt(searchParams.get("tahun") || "0");

    if (!bulan || !tahun) {
      return NextResponse.json(
        { error: "Bulan dan tahun harus diisi" },
        { status: 400 },
      );
    }

    const awalBulan = new Date(Date.UTC(tahun, bulan - 1, 1));
    const akhirBulan = new Date(Date.UTC(tahun, bulan, 1));

    const absensi = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: awalBulan,
          lt: akhirBulan,
        },
      },
      orderBy: { tanggal: "asc" },
    });

    return NextResponse.json(absensi);
  } catch (error) {
    console.error("GET absensi error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data absensi" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tipe, bulan, tahun } = await request.json();

    if (!tipe || !bulan || !tahun) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    // Hitung jumlah hari di bulan tersebut
    const jumlahHari = new Date(tahun, bulan, 0).getDate();

    // Buat absensi untuk setiap hari
    const results = await Promise.allSettled(
      Array.from({ length: jumlahHari }, (_, i) => {
        //mengulang dari 0 hingga jumlahHari-1
        const tanggal = new Date(Date.UTC(tahun, bulan - 1, i + 1));
        return prisma.absensi.create({
          data: {
            tipe: tipe as TipeAbsensi,
            tanggal,
          },
        });
      }),
    );

    const berhasil = results.filter((r) => r.status === "fulfilled").length;
    const duplikat = results.filter((r) => r.status === "rejected").length;

    if (berhasil === 0) {
      return NextResponse.json(
        { error: "Absensi bulan ini sudah dibuat sebelumnya!" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      berhasil,
      duplikat,
    });
  } catch (error) {
    console.error("POST absensi error:", error);
    return NextResponse.json(
      { error: "Gagal membuat absensi" },
      { status: 500 },
    );
  }
}
