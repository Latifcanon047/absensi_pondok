"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SkeletonLeaderboard from "@/components/skeleton/SkeletonLeaderboard";

type LeaderboardItem = {
  id: number;
  nama: string;
  skorKedisiplinan: number;
  skorTanggungJawab: number;
  skorFinal: number;
};

export default function LeaderboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dariTanggal, setDariTanggal] = useState(() => {
    return (
      searchParams.get("dariTanggal") ||
      formatDateLocal(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      )
    );
  });

  const [sampaiTanggal, setSampaiTanggal] = useState(() => {
    return (
      searchParams.get("sampaiTanggal") ||
      formatDateLocal(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      )
    );
  });

  const [tanggalAwal, setTanggalAwal] = useState(() => {
    return (
      searchParams.get("dariTanggal") ||
      formatDateLocal(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      )
    );
  });

  const [tanggalAkhir, setTanggalAkhir] = useState(() => {
    return (
      searchParams.get("sampaiTanggal") ||
      formatDateLocal(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      )
    );
  });

  const handleFilterTanggal = async () => {
    const params = new URLSearchParams();
    // Validasi input
    if (!dariTanggal || !sampaiTanggal) {
      alert("Tanggal awal dan tanggal akhir harus diisi.");
      setLoading(false);
      return;
    }

    const regexTanggal = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexTanggal.test(dariTanggal) || !regexTanggal.test(sampaiTanggal)) {
      alert("Format tanggal tidak valid. Gunakan format YYYY-MM-DD.");
      setLoading(false);
      return;
    }

    const dari = new Date(dariTanggal);
    const sampai = new Date(sampaiTanggal);

    if (isNaN(dari.getTime()) || isNaN(sampai.getTime())) {
      alert("Tanggal tidak valid.");
      setLoading(false);
      return;
    }

    if (sampai < dari) {
      alert("Tanggal akhir tidak boleh lebih awal dari tanggal awal.");
      setLoading(false);
      return;
    }

    params.set("dariTanggal", dariTanggal);
    params.set("sampaiTanggal", sampaiTanggal);
    router.replace(`?${params.toString()}`);
    setTanggalAwal(dariTanggal);
    setTanggalAkhir(sampaiTanggal);
    handleLihat();
  };

  const [hasil, setHasil] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

  function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function handleLihat() {
    setLoading(true);
    setSudahCari(false);
    console.log(tanggalAwal);

    const params = new URLSearchParams({ dariTanggal, sampaiTanggal });

    try {
      const res = await fetch(`/api/leaderboard?${params}`);
      const data = await res.json();
      setHasil(data);
      setSudahCari(true);
    } catch {
      console.error("Gagal fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }

  function formatTanggalIndonesia(dateString: string) {
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const [year, month, day] = dateString.split("-");
    ``;
    return `${parseInt(day)} ${bulan[parseInt(month) - 1]} ${year}`;
  }

  useEffect(() => {
    handleLihat();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-3xl">🏆</span>
          Leaderboard
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Peringkat kedisiplinan santri
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-all duration-300">
        <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-700">
              Filter Periode
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dariTanggal}
                onChange={(e) => setDariTanggal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={sampaiTanggal}
                onChange={(e) => setSampaiTanggal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleFilterTanggal}
            disabled={loading}
            className="group relative bg-linear-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memuat...
              </>
            ) : (
              <>Lihat Leaderboard</>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <>
          <SkeletonLeaderboard cardCount={6} />
        </>
      )}

      {/* Hasil */}
      {sudahCari &&
        (hasil.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 font-medium">
              Belum ada data untuk periode ini
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Coba pilih rentang tanggal yang lain
            </p>
          </div>
        ) : (
          <>
            <div className="bg-linear-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden my-6">
              <div className="px-6 py-4 border-b border-gray-100 bg-white/50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-800">
                      Rekap {formatTanggalIndonesia(tanggalAwal)}
                      <span className="text-gray-400 mx-2">→</span>
                      {formatTanggalIndonesia(tanggalAkhir)}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hasil.map((santri, index) => (
                <div
                  key={santri.id}
                  className={`
              group relative bg-white rounded-2xl shadow-sm border-2 p-6 
              hover:shadow-xl transition-all duration-300 hover:-translate-y-1
              ${
                index === 0
                  ? "border-amber-400 bg-linear-to-br from-amber-50/30 to-white"
                  : index === 1
                    ? "border-gray-300 bg-linear-to-br from-gray-50/30 to-white"
                    : index === 2
                      ? "border-orange-300 bg-linear-to-br from-orange-50/30 to-white"
                      : "border-gray-100 hover:border-emerald-200"
              }
            `}
                >
                  {/* Medal and Rank */}
                  <div className="absolute -top-3 -left-3">
                    <div
                      className={`
                w-10 h-10 rounded-full flex items-center justify-center shadow-md
                ${
                  index === 0
                    ? "bg-amber-300"
                    : index === 1
                      ? "bg-gray-400"
                      : index === 2
                        ? "bg-orange-200"
                        : "bg-gray-300"
                }
              `}
                    >
                      <span className="text-white font-bold text-lg">
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Nama Santri */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-lg">
                          {santri.nama.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {santri.nama}
                        </h3>
                      </div>
                    </div>

                    {/* Skor Final */}
                    <div
                      className={`
  px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap
  ${
    santri.skorFinal >= 95
      ? "bg-green-100 text-green-700"
      : santri.skorFinal >= 90
        ? "bg-blue-100 text-blue-600"
        : santri.skorFinal >= 85
          ? "bg-orange-100 text-orange-600"
          : santri.skorFinal >= 75
            ? "bg-red-100 text-red-700"
            : "bg-red-200 text-red-800"
  }
`}
                    >
                      Skor {santri.skorFinal}%
                    </div>
                  </div>

                  {/* Detail Skor */}
                  <div className="space-y-3">
                    {/* Kedisiplinan */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                          Kedisiplinan
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            santri.skorKedisiplinan >= 95
                              ? "text-emerald-600"
                              : santri.skorKedisiplinan >= 90
                                ? "text-blue-600"
                                : santri.skorKedisiplinan >= 85
                                  ? "text-orange-500"
                                  : santri.skorKedisiplinan >= 75
                                    ? "text-red-500"
                                    : "text-red-700"
                          }`}
                        >
                          {santri.skorKedisiplinan}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            santri.skorKedisiplinan >= 95
                              ? "bg-emerald-600"
                              : santri.skorKedisiplinan >= 90
                                ? "bg-blue-600"
                                : santri.skorKedisiplinan >= 85
                                  ? "bg-orange-500"
                                  : santri.skorKedisiplinan >= 75
                                    ? "bg-red-500"
                                    : "bg-red-700"
                          }`}
                          style={{ width: `${santri.skorKedisiplinan}%` }}
                        />
                      </div>
                    </div>

                    {/* Tanggung Jawab */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                          Tanggung Jawab
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            santri.skorTanggungJawab >= 95
                              ? "text-emerald-600"
                              : santri.skorTanggungJawab >= 90
                                ? "text-blue-600"
                                : santri.skorTanggungJawab >= 85
                                  ? "text-orange-500"
                                  : santri.skorTanggungJawab >= 75
                                    ? "text-red-500"
                                    : "text-red-700"
                          }`}
                        >
                          {santri.skorTanggungJawab}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            santri.skorTanggungJawab >= 95
                              ? "bg-emerald-600"
                              : santri.skorTanggungJawab >= 90
                                ? "bg-blue-600"
                                : santri.skorTanggungJawab >= 85
                                  ? "bg-orange-500"
                                  : santri.skorTanggungJawab >= 75
                                    ? "bg-red-500"
                                    : "bg-red-700"
                          }`}
                          style={{ width: `${santri.skorTanggungJawab}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-4"></div>

                  {/* Skor Final */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <span>🎯</span> Skor Final
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            santri.skorFinal >= 95
                              ? "bg-emerald-600"
                              : santri.skorFinal >= 90
                                ? "bg-blue-600"
                                : santri.skorFinal >= 85
                                  ? "bg-orange-500"
                                  : santri.skorFinal >= 75
                                    ? "bg-red-500"
                                    : "bg-red-700"
                          }`}
                          style={{ width: `${santri.skorFinal}%` }}
                        />
                      </div>
                      <span
                        className={`text-base font-bold ${
                          santri.skorFinal >= 95
                            ? "text-emerald-600"
                            : santri.skorFinal >= 90
                              ? "text-blue-600"
                              : santri.skorFinal >= 85
                                ? "text-orange-500"
                                : santri.skorFinal >= 75
                                  ? "text-red-500"
                                  : "text-red-700"
                        }`}
                      >
                        {santri.skorFinal}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ))}
    </div>
  );
}
