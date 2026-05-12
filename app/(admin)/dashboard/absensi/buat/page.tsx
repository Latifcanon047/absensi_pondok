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
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const jumlahHari = new Date(tahun, bulan, 0).getDate(); //ngambil tanggal terkhir dari bulan tersebut

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulan, tahun }),
      });

      if (res.status === 409) {
        setError("Absensi bulan ini sudah dibuat sebelumnya!");
        return;
      }

      if (!res.ok) {
        setError("Terjadi kesalahan saat membuat absensi");
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
      <h1 className=" pt-5 sm:pt-15 md:pt-5 text-2xl font-bold text-gray-800 mb-6">
        Buat Absensi
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
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
              Akan dibuat <strong>{jumlahHari} hari</strong> ×{" "}
              <strong>4 jenis</strong> absensi untuk {BULAN[bulan - 1]} {tahun}
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
