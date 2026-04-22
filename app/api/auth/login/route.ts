import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi" },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 },
      );
    }

    const session = await getIronSession<SessionData>( //<sessionData> itu untuk memberi tahu TypeScript tipe data dari session yang kita gunakan
      await cookies(),
      sessionOptions,
    );
    session.userId = admin.id;
    session.username = admin.username;
    session.isAdmin = true;
    await session.save();

    return NextResponse.json({ success: true }); //response untuk frontend bahwa login berhasil
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      //response untuk frontend bahwa terjadi kesalahan pada server
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
