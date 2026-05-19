import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 relative">
      {/* Login Link - Pojok Kanan Atas */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <Link
          href="/dashboard/absensi"
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-emerald-600 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span>Absensi</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl px-2 sm:px-0">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            Absensi <span className="text-emerald-600">Pesantren</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-500">
            Mempermudah pengelolaan absensi dan kedisiplinan santri
          </p>
          <div className="w-16 h-0.5 bg-emerald-500 mx-auto mt-3 sm:mt-4 rounded-full"></div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          <Link
            href="/rekap-absen"
            className="group bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-xl mb-3 sm:mb-4 group-hover:bg-emerald-100 transition-colors">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
                Rekap Absensi
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Lihat rekap kedisiplinan santri
              </p>
            </div>
          </Link>

          <Link
            href="/leaderboard"
            className="group bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-amber-50 rounded-xl mb-3 sm:mb-4 group-hover:bg-amber-100 transition-colors">
                <span className="text-xl sm:text-2xl">🏆</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
                Leaderboard
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Ranking kedisiplinan santri
              </p>
            </div>
          </Link>

          <Link
            href="/rekap-piket"
            className="group bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl mb-3 sm:mb-4 group-hover:bg-blue-100 transition-colors">
                <span className="text-xl sm:text-2xl">📈</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
                Rekap piket
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Lihat rekap Tanggung Jawab santri
              </p>
            </div>
          </Link>

          {/* Data Absen - Card Baru */}
          <Link
            href="/data-absen"
            className="group bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-300 hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-xl mb-3 sm:mb-4 group-hover:bg-purple-100 transition-colors">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
                Data Absen
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Kelola dan lihat data absensi santri
              </p>
            </div>
          </Link>
        </div>

        {/* Decorative Footer */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-[10px] sm:text-xs text-gray-400">
            © {new Date().getFullYear()} Absensi Pesantren
          </p>
        </div>
      </div>
    </main>
  );
}
