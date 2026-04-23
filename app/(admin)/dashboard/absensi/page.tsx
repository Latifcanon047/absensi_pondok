"use client";

import { useState, useEffect } from "react";
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

type Absensi = {
  id: number;
  tipe: "SHOLAT" | "KELAS";
  mingguKe: number;
  bulan: number;
  tahun: number;
  tanggalMulai: string;
  tanggalSelesai: string;
};

export default function ListAbsensiPage() {
  const router = useRouter();
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [hasil, setHasil] = useState<Absensi[]>([]);
  const [sudahCari, setSudahCari] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setBulan(new Date().getMonth() + 1);
    setTahun(new Date().getFullYear());
    handleCari();
  }, []);

  async function handleCari() {
    setLoading(true);
    setSudahCari(false);

    try {
      const res = await fetch(`/api/absensi?bulan=${bulan}&tahun=${tahun}`);
      const data = await res.json();
      setHasil(data);
      setSudahCari(true);

      if (data.length === 0) {
        setShowDialog(true);
      }
    } catch {
      console.error("Gagal fetch absensi");
    } finally {
      setLoading(false);
    }
  }

  function handleBuatAbsensi() {
    router.push(`/dashboard/absensi/buat?bulan=${bulan}&tahun=${tahun}`);
  }

  const sholat = hasil.filter((a) => a.tipe === "SHOLAT");
  const kelas = hasil.filter((a) => a.tipe === "KELAS");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">List Absensi</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          disabled={loading} //biar gak bisa klik tombol cari berkali-kali pas lagi loading
          className="mt-4 bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </div>

      {/* Hasil */}
      {sudahCari && hasil.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {sholat &&
              sholat.map((s) => (
                <button
                  onClick={() =>
                    router.push(`/dashboard/absensi/${s.id}/sholat`)
                  }
                  className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4 text-left hover:bg-green-100 transition"
                >
                  <p className="font-medium text-green-700">📿 Absen Sholat</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(s.tanggalMulai).toLocaleDateString("id-ID")} —{" "}
                    {new Date(s.tanggalSelesai).toLocaleDateString("id-ID")}
                  </p>
                </button>
              ))}
            {kelas &&
              kelas.map((k) => (
                <button
                  onClick={() =>
                    router.push(`/dashboard/absensi/${k.id}/kelas`)
                  }
                  className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left hover:bg-blue-100 transition"
                >
                  <p className="font-medium text-blue-700">📚 Absen Kelas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(k.tanggalMulai).toLocaleDateString("id-ID")} —{" "}
                    {new Date(k.tanggalSelesai).toLocaleDateString("id-ID")}
                  </p>
                </button>
              ))}
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
                onClick={handleBuatAbsensi}
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
