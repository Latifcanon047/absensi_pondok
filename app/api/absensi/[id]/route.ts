import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const absensi = await prisma.absensi.findUnique({
      where: { id: parseInt(id) },
    });

    if (!absensi) {
      return NextResponse.json(
        { error: "Absensi tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(absensi);
  } catch (error) {
    console.error("GET absensi by id error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
