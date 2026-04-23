"use client";

import { useState } from "react";

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

type RekapSantri = {
  id: number;
  nama: string;
  isArchived: boolean;
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
};

export default function RekapPage() {
  const [mode, setMode] = useState<"bulan" | "minggu">("bulan");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [mingguKe, setMingguKe] = useState(1);
  const [hasil, setHasil] = useState<RekapSantri[]>([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

  async function handleLihatRekap() {
    setLoading(true);
    setSudahCari(false);

    const params = new URLSearchParams({
      mode,
      bulan: String(bulan),
      tahun: String(tahun),
      mingguKe: String(mingguKe),
    });

    try {
      const res = await fetch(`/api/rekap?${params}`);
      const data = await res.json();
      setHasil(data);
      setSudahCari(true);
    } catch {
      console.error("Gagal fetch rekap");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportExcel() {
    const XLSX = await import("xlsx");

    const dataExport = hasil.map((santri, index) => ({
      No: index + 1,
      Nama: santri.nama,
      Hadir: santri.hadir,
      Telat: santri.telat,
      Sakit: santri.sakit,
      Izin: santri.izin,
      Alpa: santri.alpa,
      "Kedisiplinan (%)": santri.skor,
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Absen");

    const periode =
      mode === "bulan"
        ? `${BULAN[bulan - 1]} ${tahun}`
        : `Minggu ke-${mingguKe} ${BULAN[bulan - 1]} ${tahun}`;

    XLSX.writeFile(wb, `Rekap Absen ${periode}.xlsx`);
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    const periode =
      mode === "bulan"
        ? `${BULAN[bulan - 1]} ${tahun}`
        : `Minggu ke-${mingguKe} ${BULAN[bulan - 1]} ${tahun}`;

    // Header
    doc.setFontSize(16);
    doc.setTextColor(26, 107, 60);
    doc.text("Rekap Absen Pesantren", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Periode: ${periode}`, 14, 30);

    // Tabel
    autoTable(doc, {
      startY: 38,
      head: [
        [
          "No",
          "Nama",
          "Hadir",
          "Telat",
          "Sakit",
          "Izin",
          "Alpa",
          "Kedisiplinan (%)",
        ],
      ],
      body: hasil.map((santri, index) => [
        index + 1,
        santri.nama,
        santri.hadir,
        santri.telat,
        santri.sakit,
        santri.izin,
        santri.alpa,
        `${santri.skor}%`,
      ]),
      headStyles: {
        fillColor: [26, 107, 60],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 250, 244],
      },
      styles: {
        fontSize: 10,
      },
    });

    doc.save(`Rekap Absen ${periode}.pdf`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Rekap Absen</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {/* Toggle Mode */}
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
          {/* Minggu (hanya muncul kalau mode minggu) */}
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
        </div>

        <button
          onClick={handleLihatRekap}
          disabled={loading}
          className="bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {loading ? "Memuat..." : "Lihat Rekap"}
        </button>
      </div>

      {/* Tabel Hasil */}
      {sudahCari && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-700">
              Rekap{" "}
              {mode === "bulan"
                ? BULAN[bulan - 1]
                : `Minggu ke-${mingguKe} ${BULAN[bulan - 1]}`}{" "}
              {tahun}
            </h2>
          </div>
          {hasil.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Belum ada data absensi untuk periode ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600">No</th>
                    <th className="text-left px-4 py-3 text-gray-600">Nama</th>
                    <th className="text-center px-4 py-3 text-green-600">
                      Hadir
                    </th>
                    <th className="text-center px-4 py-3 text-orange-600">
                      Telat
                    </th>
                    <th className="text-center px-4 py-3 text-yellow-600">
                      Sakit
                    </th>
                    <th className="text-center px-4 py-3 text-blue-600">
                      Izin
                    </th>
                    <th className="text-center px-4 py-3 text-red-600">Alpa</th>
                    <th className="text-center px-4 py-3 text-gray-600">
                      Kedisiplinan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.map((santri, index) => (
                    <tr key={santri.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        {santri.nama}
                        {santri.isArchived && (
                          <span className="ml-2 text-xs text-gray-400">
                            (nonaktif)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-green-600">
                        {santri.hadir}
                      </td>
                      <td className="px-4 py-3 text-center text-orange-600">
                        {santri.telat}
                      </td>
                      <td className="px-4 py-3 text-center text-yellow-600">
                        {santri.sakit}
                      </td>
                      <td className="px-4 py-3 text-center text-blue-600">
                        {santri.izin}
                      </td>
                      <td className="px-4 py-3 text-center text-red-600">
                        {santri.alpa}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-[#1a6b3c]">
                        {santri.skor}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {sudahCari && hasil.length > 0 && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleExportExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
              >
                📥 Export Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
              >
                📄 Export PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
