import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMingguRange } from "@/lib/utils";
import { TipeAbsensi } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = parseInt(searchParams.get("bulan") || "0");
    const tahun = parseInt(searchParams.get("tahun") || "0");
    const mingguKe = parseInt(searchParams.get("mingguKe") || "0");

    if (!bulan || !tahun || !mingguKe) {
      return NextResponse.json(
        { error: "Bulan, tahun, dan minggu harus diisi" },
        { status: 400 },
      );
    }

    //cirian
    const absensi = await prisma.absensi.findMany({
      where: { bulan, tahun, mingguKe },
    }); //kalo gak ada hasilnya akan jadi array kosong, bukan error. Jadi kita gak perlu cek lagi apakah hasilnya ada atau tidak, cukup langsung return aja

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
    const { tipe, mingguKe, bulan, tahun } = await request.json();

    if (!tipe || !mingguKe || !bulan || !tahun) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    // Cek duplikat
    const existing = await prisma.absensi.findUnique({
      where: {
        tipe_mingguKe_bulan_tahun: {
          tipe: tipe as TipeAbsensi,
          mingguKe,
          bulan,
          tahun,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Absensi untuk periode ini sudah ada" },
        { status: 409 },
      );
    }

    const { tanggalMulai, tanggalSelesai } = getMingguRange(
      mingguKe,
      bulan,
      tahun,
    );

    const absensi = await prisma.absensi.create({
      data: {
        tipe: tipe as TipeAbsensi,
        mingguKe,
        bulan,
        tahun,
        tanggalMulai,
        tanggalSelesai,
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
