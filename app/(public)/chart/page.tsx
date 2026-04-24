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
  const [dariTanggal, setDariTanggal] = useState(
    formatDateLocal(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
  );
  const [sampaiTanggal, setSampaiTanggal] = useState(
    formatDateLocal(new Date()),
  );
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
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

    const params = new URLSearchParams({
      dariTanggal,
      sampaiTanggal,
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
          {loading ? "Memuat..." : "Lihat Rekap"}
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
