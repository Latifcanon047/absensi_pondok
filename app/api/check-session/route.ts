import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const hasSession = (await cookieStore).has("absensi-session");

  return NextResponse.json({ authenticated: hasSession });
}
