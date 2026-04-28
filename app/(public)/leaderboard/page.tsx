"use client";

import { useEffect, useState } from "react";

type LeaderboardItem = {
  id: number;
  nama: string;
  skorKedisiplinan: number;
  skorTanggungJawab: number;
  skorFinal: number;
};

export default function LeaderboardPage() {
  const [dariTanggal, setDariTanggal] = useState(
    formatDateLocal(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
  );

  const [sampaiTanggal, setSampaiTanggal] = useState(
    formatDateLocal(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    ),
  );
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

  function getMedal(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  }

  function getCardStyle(index: number) {
    if (index === 0) return "border-yellow-400 bg-yellow-50";
    if (index === 1) return "border-gray-300 bg-gray-50";
    if (index === 2) return "border-orange-300 bg-orange-50";
    return "border-gray-200 bg-white";
  }

  function getSkorColor(skor: number) {
    if (skor >= 80) return "text-green-600";
    if (skor >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏆 Leaderboard</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-4">
          Pilih Range Tanggal
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
            />
          </div>
        </div>
        <button
          onClick={handleLihat}
          disabled={loading}
          className="bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {loading ? "Memuat..." : "Lihat Leaderboard"}
        </button>
      </div>

      {/* Hasil */}
      {sudahCari &&
        (hasil.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Belum ada data untuk periode ini
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hasil.map((santri, index) => (
              <div
                key={santri.id}
                className={`border-2 rounded-xl p-5 ${getCardStyle(index)}`}
              >
                {/* Header kartu */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{getMedal(index)}</span>
                  <span
                    className={`text-3xl font-bold ${getSkorColor(santri.skorFinal)}`}
                  >
                    {santri.skorFinal}%
                  </span>
                </div>

                {/* Nama */}
                <p className="font-semibold text-gray-800 text-lg mb-4">
                  {santri.nama}
                </p>

                {/* Detail skor */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      ⭐ Kedisiplinan
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-[#1a6b3c] h-1.5 rounded-full"
                          style={{ width: `${santri.skorKedisiplinan}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${getSkorColor(santri.skorKedisiplinan)}`}
                      >
                        {santri.skorKedisiplinan}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      🏠 Tanggung Jawab
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${santri.skorTanggungJawab}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${getSkorColor(santri.skorTanggungJawab)}`}
                      >
                        {santri.skorTanggungJawab}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Garis pemisah */}
                <div className="border-t border-gray-200 mt-4 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">
                      Skor Final
                    </span>
                    <span
                      className={`text-sm font-bold ${getSkorColor(santri.skorFinal)}`}
                    >
                      = {santri.skorFinal}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
