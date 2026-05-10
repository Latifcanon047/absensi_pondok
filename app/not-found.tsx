import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1a6b3c] mb-2">404</h1>
        <p className="text-gray-500 mb-8">
          Halaman yang kamu cari tidak ditemukan
        </p>
        <Link
          href="/"
          className="bg-[#1a6b3c] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#164d2f] transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
