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

export default function BuatAbsensiPage() {
  const router = useRouter();

  const [tipe, setTipe] = useState<"SHOLAT" | "KELAS">("SHOLAT");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const jumlahHari = new Date(tahun, bulan, 0).getDate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipe, bulan, tahun }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError("Absensi bulan ini sudah dibuat sebelumnya!");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      router.push("/dashboard/absensi");
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Buat Absensi</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pilih Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Absensi
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTipe("SHOLAT")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  tipe === "SHOLAT"
                    ? "bg-[#1a6b3c] text-white border-[#1a6b3c]"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                📿 Absen Sholat
              </button>
              <button
                type="button"
                onClick={() => setTipe("KELAS")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  tipe === "KELAS"
                    ? "bg-[#1a6b3c] text-white border-[#1a6b3c]"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                📚 Absen Kelas
              </button>
            </div>
          </div>

          {/* Bulan */}
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

          {/* Tahun */}
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

          {/* Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-xs text-green-700 font-medium">Info:</p>
            <p className="text-sm text-green-800">
              Akan dibuat <strong>{jumlahHari} hari</strong> absensi untuk{" "}
              {BULAN[bulan - 1]} {tahun}
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6b3c] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#164d2f] transition disabled:opacity-50"
          >
            {loading
              ? "Membuat..."
              : `Buat Absensi ${BULAN[bulan - 1]} ${tahun}`}
          </button>
        </form>
      </div>
    </div>
  );
}
