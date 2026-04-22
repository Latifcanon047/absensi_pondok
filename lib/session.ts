import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "absensi_pesantren_secret_key_yang_panjang_123456", //untuk mengacak data session, harus panjang dan kompleks untuk keamanan
  cookieName: "absensi-session", // nama cookie yang akan disimpan di browser
  cookieOptions: {
    httpOnly: true, // Hanya bisa diakses melalui HTTP, tidak bisa diakses melalui JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Mencegah pengiriman cookie pada permintaan lintas situs, kecuali untuk navigasi top-level
    path: "/", // Cookie akan tersedia untuk seluruh aplikasi
  },
};

export type SessionData = {
  // Tipe data yang akan disimpan di session
  userId: number;
  username: string;
  isAdmin: boolean;
};
