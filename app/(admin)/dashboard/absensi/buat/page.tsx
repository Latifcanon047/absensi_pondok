"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMingguRange, formatTanggal } from "@/lib/utils";

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
  const router = useRouter();//buat navigasi ke halaman lain setelah berhasil buat absensi baru
  const searchParams = useSearchParams();//buat baca query params dari url, nanti kita pake ini buat set default value di formnya, jadi kalo misal user udah pilih minggu ke-2, bulan Maret, tahun 2024, terus dia klik buat absensi baru, maka formnya bakal otomatis terisi dengan minggu ke-2, bulan Maret, tahun 2024. Jadi user gak perlu pilih lagi dari awal. Kalo gak ada query paramsnya, yaudah defaultnya minggu ke-1, bulan sekarang, tahun sekarang. Jadi ini buat ningkatin UX aja biar gak ribet harus pilih dari awal terus tiap kali mau buat absensi baru.

  const [tipe, setTipe] = useState<"SHOLAT" | "KELAS">("SHOLAT");//defaultnya sholat, dan hanya bisa pilih antara sholat atau kelas
  const [mingguKe, setMingguKe] = useState(
    parseInt(searchParams.get("mingguKe") || "1"),
  );
  const [bulan, setBulan] = useState(
    parseInt(searchParams.get("bulan") || String(new Date().getMonth() + 1)),
  );
  const [tahun, setTahun] = useState(
    parseInt(searchParams.get("tahun") || String(new Date().getFullYear())),
  );
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { tanggalMulai, tanggalSelesai } = getMingguRange(
      mingguKe,
      bulan,
      tahun,
    );
    setPreview(
      `${formatTanggal(tanggalMulai)} – ${formatTanggal(tanggalSelesai)}`,
    );
  }, [mingguKe, bulan, tahun]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },//memberi tahu server bahwa body request ini berformat JSON, jadi server bisa parse dengan benar
        body: JSON.stringify({ tipe, mingguKe, bulan, tahun }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError(
          `Absensi ${tipe === "SHOLAT" ? "Sholat" : "Kelas"} minggu ini sudah dibuat!`,
        );
        return;
      }

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      const path =
        tipe === "SHOLAT"
          ? `/dashboard/absensi/${data.id}/sholat`
          : `/dashboard/absensi/${data.id}/kelas`;

      router.push(path);
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

          {/* Minggu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minggu Ke-
            </label>
            <select
              value={mingguKe}
              onChange={(e) => setMingguKe(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
            >
              {[1, 2, 3, 4, 5].map((m) => (
                <option key={m} value={m}>
                  Minggu ke-{m}
                </option>
              ))}
            </select>
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

          {/* Preview */}
          {preview && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-xs text-green-700 font-medium">Periode:</p>
              <p className="text-sm text-green-800">{preview}</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6b3c] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#164d2f] transition disabled:opacity-50"
          >
            {loading ? "Membuat..." : "Buat Absensi"}
          </button>
        </form>
      </div>
    </div>
  );
}
