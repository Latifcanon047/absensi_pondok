"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BULAN = [
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

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

type Absensi = {
  id: number;
  tipe: "SHOLAT" | "KELAS";
  tanggal: string;
};

export default function ListAbsensiPage() {
  const router = useRouter();
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [hasil, setHasil] = useState<Absensi[]>([]);
  const [sudahCari, setSudahCari] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"SHOLAT" | "KELAS">("SHOLAT");

  async function handleCari() {
    setLoading(true);
    setSudahCari(false);

    try {
      const res = await fetch(`/api/absensi?bulan=${bulan}&tahun=${tahun}`);
      const data = await res.json();
      setHasil(data);
      setSudahCari(true);
      if (data.length === 0) setShowDialog(true);
    } catch {
      console.error("Gagal fetch absensi");
    } finally {
      setLoading(false);
    }
  }

  const sholatList = hasil.filter((a) => a.tipe === "SHOLAT");
  const kelasList = hasil.filter((a) => a.tipe === "KELAS");
  const activeList = activeTab === "SHOLAT" ? sholatList : kelasList;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">List Absensi</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
            >
              {BULAN.map((b, i) => (
                <option key={i} value={i + 1}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
            />
          </div>
        </div>
        <button
          onClick={handleCari}
          disabled={loading}
          className="mt-4 bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </div>

      {/* Hasil */}
      {sudahCari && hasil.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Tab */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("SHOLAT")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                activeTab === "SHOLAT"
                  ? "bg-[#1a6b3c] text-white border-[#1a6b3c]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              📿 Sholat ({sholatList.length})
            </button>
            <button
              onClick={() => setActiveTab("KELAS")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                activeTab === "KELAS"
                  ? "bg-[#1a6b3c] text-white border-[#1a6b3c]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              📚 Kelas ({kelasList.length})
            </button>
          </div>

          {/* List Tanggal */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {activeList.map((a) => {
              const tanggal = new Date(a.tanggal);
              const namaHari = HARI[tanggal.getDay()];
              return (
                <button
                  key={a.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/absensi/${a.id}/${a.tipe === "SHOLAT" ? "sholat" : "kelas"}`,
                    )
                  }
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center hover:bg-green-50 hover:border-green-300 transition"
                >
                  <p className="text-xs text-gray-500">{namaHari}</p>
                  <p className="text-lg font-bold text-gray-800">
                    {tanggal.getDate()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {BULAN[tanggal.getMonth()]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dialog belum ada absensi */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-2">Absensi Belum Dibuat</h2>
            <p className="text-gray-600 text-sm mb-6">
              Absensi {BULAN[bulan - 1]} {tahun} belum dibuat. Mau buat
              sekarang?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Tidak
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/absensi/buat?bulan=${bulan}&tahun=${tahun}`,
                  )
                }
                className="px-4 py-2 text-sm bg-[#1a6b3c] text-white rounded-lg hover:bg-[#164d2f]"
              >
                Ya, Buat Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
