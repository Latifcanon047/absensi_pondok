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

    const awalBulan = new Date(Date.UTC(tahun, bulan - 1, 1)); //bulan - 1 karena bulan mulai dari nol jadi kao bulan mei yang aslinya itu bulan ke 5 harus di kurangi 1 supaya jadi hasilnya bulan mei
    const akhirBulan = new Date(Date.UTC(tahun, bulan, 1)); // ini trik untuk mengambil tanggal terakhir di bulan tertentu. menggunakan >=  <

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
    const { bulan, tahun } = await request.json();

    if (!bulan || !tahun) {
      return NextResponse.json(
        { error: "Bulan dan tahun harus diisi" },
        { status: 400 },
      );
    }

    const jumlahHari = new Date(tahun, bulan, 0).getDate();
    const SEMUA_TIPE: TipeAbsensi[] = ["SHOLAT", "KELAS", "MAKAN", "ASRAMA"];

    // Buat semua tanggal UTC
    const tanggalList = Array.from(
      { length: jumlahHari },
      (_, i) => new Date(Date.UTC(tahun, bulan - 1, i + 1)),
    );

    // Cek duplikat dulu sebelum transaksi
    const existing = await prisma.absensi.findFirst({
      where: {
        tipe: { in: SEMUA_TIPE },
        tanggal: { in: tanggalList },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Absensi bulan ini sudah dibuat sebelumnya!" },
        { status: 409 },
      );
    }

    // Satu transaksi untuk semua tipe × semua hari
    await prisma.$transaction(
      SEMUA_TIPE.flatMap((tipe) =>
        tanggalList.map((tanggal) =>
          prisma.absensi.create({
            data: { tipe, tanggal },
          }),
        ),
      ),
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST absensi error:", error);
    return NextResponse.json(
      { error: "Gagal membuat absensi" },
      { status: 500 },
    );
  }
}
