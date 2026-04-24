"use client";

import { useState } from "react";

type LeaderboardItem = {
  id: number;
  nama: string;
  hadir: number;
  telat: number;
  alpa: number;
  skor: number;
};

export default function LeaderboardPage() {
  const [dariTanggal, setDariTanggal] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [sampaiTanggal, setSampaiTanggal] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  );
  const [hasil, setHasil] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🏆 Leaderboard Kedisiplinan
      </h1>

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
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{getMedal(index)}</span>
                  <span className="text-2xl font-bold text-[#1a6b3c]">
                    {santri.skor}%
                  </span>
                </div>
                <p className="font-semibold text-gray-800 text-lg mb-3">
                  {santri.nama}
                </p>
                <div className="flex gap-3 text-xs text-gray-600">
                  <span className="text-green-600">
                    ✅ {santri.hadir} hadir
                  </span>
                  <span className="text-orange-600">
                    🕐 {santri.telat} telat
                  </span>
                  <span className="text-red-600">❌ {santri.alpa} alpa</span>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
