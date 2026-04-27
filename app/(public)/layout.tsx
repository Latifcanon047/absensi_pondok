import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-[#1a6b3c] text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-lg">
            Absensi Pesantren
          </Link>
          <div className="flex gap-6 text-sm">
            <Link href="/rekap" className="hover:text-green-200 transition">
              Kedisiplinan
            </Link>
            <Link
              href="/rekap-piket"
              className="hover:text-green-200 transition"
            >
              Tanggung Jawab
            </Link>
            <Link
              href="/leaderboard"
              className="hover:text-green-200 transition"
            >
              Leaderboard
            </Link>
            <Link
              href="dashboard/absensi"
              className="hover:text-green-200 transition"
            >
              Absensi
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
