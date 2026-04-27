import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalSantri] = await Promise.all([
      prisma.santri.count({ where: { isArchived: false } }),
    ]);

    return NextResponse.json({
      totalSantri,
    });
  } catch (error) {
    console.error("GET dashboard error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
