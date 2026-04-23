import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="text-6xl mb-6">🕌</div>
        <h1 className="text-3xl font-bold text-[#1a6b3c] mb-2">
          Absensi Pesantren
        </h1>
        <p className="text-gray-500 mb-8">
          Sistem absensi digital untuk santri dan pengurus pesantren
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/rekap"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-transparent hover:border-[#1a6b3c]"
          >
            <p className="text-2xl mb-2">📊</p>
            <p className="font-semibold text-gray-800">Rekap</p>
            <p className="text-xs text-gray-500 mt-1">Lihat rekap absensi</p>
          </Link>
          <Link
            href="/leaderboard"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-transparent hover:border-[#1a6b3c]"
          >
            <p className="text-2xl mb-2">🏆</p>
            <p className="font-semibold text-gray-800">Leaderboard</p>
            <p className="text-xs text-gray-500 mt-1">Ranking kedisiplinan</p>
          </Link>
          <Link
            href="/chart"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-transparent hover:border-[#1a6b3c]"
          >
            <p className="text-2xl mb-2">📈</p>
            <p className="font-semibold text-gray-800">Chart</p>
            <p className="text-xs text-gray-500 mt-1">Grafik absensi</p>
          </Link>
        </div>

        <Link
          href="/login"
          className="inline-block bg-[#1a6b3c] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#164d2f] transition"
        >
          Login Admin →
        </Link>
      </div>
    </main>
  );
}
