"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

type ChartData = {
  hari: string;
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
};

type Summary = {
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
};

export default function ChartPage() {
  const [mode, setMode] = useState<"bulan" | "minggu">("bulan");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [mingguKe, setMingguKe] = useState(1);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

  async function handleLihat() {
    setLoading(true);
    setSudahCari(false);

    const params = new URLSearchParams({
      mode,
      bulan: String(bulan),
      tahun: String(tahun),
      mingguKe: String(mingguKe),
    });

    try {
      const res = await fetch(`/api/chart?${params}`);
      const data = await res.json();
      setChartData(data.chartData);
      setSummary(data.summary);
      setSudahCari(true);
    } catch {
      console.error("Gagal fetch chart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        📈 Chart Keseluruhan
      </h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("bulan")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                mode === "bulan"
                  ? "bg-[#1a6b3c] text-white border-[#1a6b3c]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Per Bulan
            </button>
            <button
              onClick={() => setMode("minggu")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                mode === "minggu"
                  ? "bg-[#1a6b3c] text-white border-[#1a6b3c]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Per Minggu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {mode === "minggu" && (
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
          )}
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
          onClick={handleLihat}
          disabled={loading}
          className="bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {loading ? "Memuat..." : "Lihat Chart"}
        </button>
      </div>

      {sudahCari && (
        <>
          {/* Line Chart */}
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">Grafik Absensi</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={[
                  {
                    name: "Hadir",
                    jumlah: summary?.hadir || 0,
                    fill: "#16a34a",
                  },
                  {
                    name: "Telat",
                    jumlah: summary?.telat || 0,
                    fill: "#ea580c",
                  },
                  {
                    name: "Sakit",
                    jumlah: summary?.sakit || 0,
                    fill: "#d97706",
                  },
                  { name: "Izin", jumlah: summary?.izin || 0, fill: "#2563eb" },
                  { name: "Alpa", jumlah: summary?.alpa || 0, fill: "#dc2626" },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" name="Jumlah" radius={[6, 6, 0, 0]}>
                  {["#16a34a", "#ea580c", "#d97706", "#2563eb", "#dc2626"].map(
                    (color, index) => (
                      <rect key={index} fill={color} />
                    ),
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Summary Kedisiplinan */}
          {summary && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-700 mb-4">
                Ringkasan Kedisiplinan Keseluruhan
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {summary.hadir}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Hadir</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {summary.telat}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">Telat</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {summary.sakit}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">Sakit</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.izin}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Izin</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {summary.alpa}
                  </p>
                  <p className="text-xs text-red-700 mt-1">Alpa</p>
                </div>
                <div className="bg-[#1a6b3c]/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[#1a6b3c]">
                    {summary.skor}%
                  </p>
                  <p className="text-xs text-[#1a6b3c] mt-1">Skor</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
