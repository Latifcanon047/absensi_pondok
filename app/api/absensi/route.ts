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
    const { tipe, tanggal } = await request.json();

    if (!tipe || !tanggal) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    const date = new Date(tanggal);

    const tanggalUTC = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    // Cek duplikat
    const existing = await prisma.absensi.findUnique({
      where: {
        tipe_tanggal: {
          tipe: tipe as TipeAbsensi,
          tanggal: tanggalUTC,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Absensi sudah ada" }, { status: 409 });
    }

    const absensi = await prisma.absensi.create({
      data: {
        tipe: tipe as TipeAbsensi,
        tanggal: tanggalUTC,
      },
    });

    return NextResponse.json(absensi, { status: 201 });
  } catch (error) {
    console.error("POST absensi error:", error);
    return NextResponse.json(
      { error: "Gagal membuat absensi" },
      { status: 500 },
    );
  }
}
