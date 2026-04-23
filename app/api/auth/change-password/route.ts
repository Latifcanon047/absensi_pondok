import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions,
    );

    if (!session.userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const { passwordLama, passwordBaru, konfirmasi } = await request.json();

    if (!passwordLama || !passwordBaru || !konfirmasi) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    if (passwordBaru !== konfirmasi) {
      return NextResponse.json(
        { error: "Password baru dan konfirmasi tidak cocok" },
        { status: 400 },
      );
    }

    if (passwordBaru.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter" },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.userId },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 },
      );
    }

    const isValid = await bcrypt.compare(passwordLama, admin.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Password lama tidak benar" },
        { status: 401 },
      );
    }

    const hash = await bcrypt.hash(passwordBaru, 12);
    await prisma.admin.update({
      where: { id: session.userId },
      data: { password: hash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
