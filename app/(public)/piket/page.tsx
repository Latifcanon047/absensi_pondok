"use client";

import { useState, useEffect } from "react";
import SkeletonRekap from "@/components/SkeletonRekap";
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

type RekapItem = {
  hadir: number;
  telat: number;
  alpa: number;
  izin: number;
  sakit: number;
  skor: number;
};

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
  makan: RekapItem;
  asrama: RekapItem;
  gabungan: RekapItem;
};

type Summary = {
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
};

export default function RekapPiketPage() {
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
  const [santri, setSantri] = useState<RekapSantri[]>([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);
  const [summaryChart, setSummaryChart] = useState<Summary | null>(null);

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
      const res = await fetch(`/api/rekap-piket?${params}`);
      const data = await res.json();
      setSantri(data.santri); // untuk tabel rekap
      setSummaryChart(data.summary); // untuk chart
      setSudahCari(true);
    } catch {
      console.error("Gagal fetch rekap piket");
    } finally {
      setLoading(false);
    }
  }
  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    const primaryColor: [number, number, number] = [26, 107, 60];
    const marginLeft = 14;
    const marginRight = 196;
    const pageWidth = 210;
    const contentWidth = pageWidth - marginLeft * 2;

    // ===== HEADER =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 5, "F");

    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN REKAP ABSEN", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Periode: ${formatTanggalIndonesia(dariTanggal)} s/d ${formatTanggalIndonesia(sampaiTanggal)}`,
      pageWidth / 2,
      28,
      { align: "center" },
    );

    doc.setDrawColor(220, 220, 220);
    doc.line(marginLeft, 34, marginRight, 34);

    // ===== HELPER TABLE =====
    const renderTable = (title: string, data: any[], startY: number) => {
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text(title, marginLeft, startY);

      doc.setDrawColor(230, 230, 230);
      doc.line(marginLeft, startY + 2, marginRight, startY + 2);

      autoTable(doc, {
        startY: startY + 6,
        head: [
          ["No", "Nama", "Hadir", "Telat", "Sakit", "Izin", "Alpa", "Skor"],
        ],
        body: data.map((s, i) => [
          i + 1,
          s.nama,
          s.hadir,
          s.telat,
          s.sakit,
          s.izin,
          s.alpa,
          `${s.skor}%`,
        ]),
        styles: {
          fontSize: 8,
          halign: "center",
        },
        headStyles: {
          fillColor: primaryColor, // HIJAU
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          fontSize: 9,
        },
        columnStyles: {
          1: { halign: "left" },
        },
        alternateRowStyles: {
          fillColor: [240, 250, 244], // hijau muda soft
        },
        margin: { left: marginLeft, right: marginLeft },
        tableWidth: contentWidth,
      });

      return (doc as any).lastAutoTable.finalY + 12;
    };

    // ===== RENDER SECTION =====
    let currentY = 40;

    currentY = renderTable(
      "Absen Piket Makan",
      santri.map((s) => ({ ...s, ...s.makan })),
      currentY,
    );

    currentY = renderTable(
      "Absen Piket Asrama",
      santri.map((s) => ({ ...s, ...s.asrama })),
      currentY,
    );

    currentY = renderTable(
      "Rekap Keseluruhan Piket",
      santri.map((s) => ({ ...s, ...s.gabungan })),
      currentY,
    );

    let finalY = currentY + 5;

    // ===== SUMMARY CARDS =====
    if (summaryChart) {
      if (finalY > 240) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("RINGKASAN TANGGUNG JAWAB KESELURUHAN", pageWidth / 2, finalY, {
        align: "center",
      });

      finalY += 10;

      const statsData = [
        {
          label: "Hadir",
          value: summaryChart.hadir,
          bg: [240, 253, 244],
          color: [22, 163, 74],
        },
        {
          label: "Telat",
          value: summaryChart.telat,
          bg: [255, 247, 237],
          color: [234, 88, 12],
        },
        {
          label: "Sakit",
          value: summaryChart.sakit,
          bg: [255, 251, 235],
          color: [217, 119, 6],
        },
        {
          label: "Izin",
          value: summaryChart.izin,
          bg: [239, 246, 255],
          color: [37, 99, 235],
        },
        {
          label: "Alpa",
          value: summaryChart.alpa,
          bg: [254, 242, 242],
          color: [220, 38, 38],
        },
        {
          label: "Skor",
          value: `${summaryChart.skor}%`,
          bg: [240, 250, 244],
          color: primaryColor,
        },
      ];

      const cardW = contentWidth / 6 - 3;
      const startX = marginLeft;

      statsData.forEach((stat, i) => {
        const xPos = startX + i * (cardW + 3.6);
        const yPos = finalY + 6;

        // background warna
        doc.setFillColor(stat.bg[0], stat.bg[1], stat.bg[2]);
        doc.roundedRect(xPos, yPos, cardW, 28, 3, 3, "F");

        // border
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(xPos, yPos, cardW, 28, 3, 3, "S");

        // label
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(stat.label, xPos + cardW / 2, yPos + 9, { align: "center" });

        // value
        doc.setFontSize(13);
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setFont("helvetica", "bold");
        doc.text(String(stat.value), xPos + cardW / 2, yPos + 22, {
          align: "center",
        });
      });
    }

    // ===== FOOTER =====
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setDrawColor(220, 220, 220);
      doc.line(marginLeft, 280, marginRight, 280);

      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);

      const now = new Date();
      const date = `${now.getDate().toString().padStart(2, "0")}/${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${now.getFullYear()}`;

      doc.text(`Dicetak: ${date}`, marginLeft, 288);
      doc.text(`Hal. ${i}/${pageCount}`, marginRight, 288, {
        align: "right",
      });
      doc.text("Pondok Pesantren", pageWidth / 2, 288, {
        align: "center",
      });
    }

    doc.save(`Rekap_Absen_${dariTanggal}_sd_${sampaiTanggal}.pdf`);
  }

  // Fungsi helper untuk format tanggal Indonesia
  function formatTanggalIndonesia(dateString: string) {
    const bulan = [
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
    const [year, month, day] = dateString.split("-");
    return `${parseInt(day)} ${bulan[parseInt(month) - 1]} ${year}`;
  }

  function TabelRekap({ data, judul }: { data: RekapSantri[]; judul: string }) {
    const key =
      judul === "Absen makan"
        ? "makan"
        : judul === "Absen asrama"
          ? "asrama"
          : "gabungan";
    return (
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 my-6">
        {/* Header dengan linear dan icon */}
        <div className="relative px-6 py-4 bg-linear-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-800">{judul}</h2>
            </div>
          </div>
        </div>

        {/* Table dengan desain modern */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  No
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Santri
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-emerald-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    Piket
                  </div>
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-orange-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    Telat
                  </div>
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-blue-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    Sakit
                  </div>
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-amber-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    <span>📝</span> Izin
                  </div>
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-red-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    Alpa
                  </div>
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-1">
                    Skor
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((santri, index) => {
                const statusData = santri[key] || santri;
                return (
                  <tr
                    key={santri.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group-hover:bg-transparent"
                  >
                    {/* Nomor Urut */}
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    {/* Nama santri */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          {santri.nama}
                        </span>
                        {santri.isArchived && (
                          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            nonaktif
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Badge untuk setiap status */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-semibold text-sm">
                        {statusData?.hadir || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-orange-50 text-orange-600 font-semibold text-sm">
                        {statusData?.telat || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm">
                        {statusData?.sakit || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 font-semibold text-sm">
                        {statusData?.izin || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-red-50 text-red-600 font-semibold text-sm">
                        {statusData?.alpa || 0}
                      </span>
                    </td>

                    {/* Skor dengan progress bar indicator */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-emerald-700 text-sm">
                          {statusData?.skor || 0}%
                        </span>
                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full"
                            style={{ width: `${statusData?.skor || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer dengan informasi tambahan (opsional) */}
        {data.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-400 text-sm">
              Tidak ada data dalam periode ini
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        Rekap Piket
      </h1>
      <p className="text-gray-500 text-sm mb-6 border-l-2 border-blue-400 pl-3">
        Lihat dan analisis data piket santri
      </p>
      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-all duration-300">
        <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-700">
              Filter Periode
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dariTanggal}
                onChange={(e) => setDariTanggal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={sampaiTanggal}
                onChange={(e) => setSampaiTanggal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleLihat}
            disabled={loading}
            className="group relative bg-linear-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memuat...
              </>
            ) : (
              <>Lihat Rekap</>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <>
          <SkeletonRekap />
        </>
      )}

      {/* Hasil */}
      {sudahCari && (
        <>
          <div className="bg-linear-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-white/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-gray-800">
                    Rekap {formatTanggalIndonesia(dariTanggal)}
                    <span className="text-gray-400 mx-2">→</span>
                    {formatTanggalIndonesia(sampaiTanggal)}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <TabelRekap data={santri} judul="Piket Makan" />
          <TabelRekap data={santri} judul="Piket asrama" />
          <TabelRekap data={santri} judul="Rekap Keseluruhan" />
          <div className="my-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Chart Keseluruhan
              </h1>
              <div className="w-12 h-1 bg-emerald-500 rounded-full mt-2"></div>
            </div>

            {sudahCari && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-all duration-300">
                  <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-linear-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                      <h2 className="font-semibold text-gray-700">
                        Grafik Absensi
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={[
                          {
                            name: "Piket",
                            jumlah: summaryChart?.hadir || 0,
                            fill: "#16a34a",
                          },
                          {
                            name: "Telat",
                            jumlah: summaryChart?.telat || 0,
                            fill: "#ea580c",
                          },
                          {
                            name: "Sakit",
                            jumlah: summaryChart?.sakit || 0,
                            fill: "#d97706",
                          },
                          {
                            name: "Izin",
                            jumlah: summaryChart?.izin || 0,
                            fill: "#2563eb",
                          },
                          {
                            name: "Alpa",
                            jumlah: summaryChart?.alpa || 0,
                            fill: "#dc2626",
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#6b7280",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "white",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            padding: "8px 12px",
                          }}
                        />
                        <Bar
                          dataKey="jumlah"
                          name="Jumlah"
                          radius={[8, 8, 0, 0]}
                        >
                          {[
                            "#16a34a",
                            "#ea580c",
                            "#d97706",
                            "#2563eb",
                            "#dc2626",
                          ].map((color, index) => (
                            <rect key={index} fill={color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {summaryChart && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-linear-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                        <h2 className="font-semibold text-gray-700">
                          Ringkasan Tanggung Jawab Keseluruhan
                        </h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        <div className="bg-linear-to-br from-green-50 to-green-100/50 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
                          <p className="text-2xl font-bold text-green-700">
                            {summaryChart.hadir}
                          </p>
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            Piket
                          </p>
                        </div>
                        <div className="bg-linear-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
                          <p className="text-2xl font-bold text-orange-700">
                            {summaryChart.telat}
                          </p>
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            Telat
                          </p>
                        </div>
                        <div className="bg-linear-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
                          <p className="text-2xl font-bold text-amber-700">
                            {summaryChart.sakit}
                          </p>
                          <p className="text-xs text-amber-600 mt-1 font-medium">
                            Sakit
                          </p>
                        </div>
                        <div className="bg-linear-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
                          <p className="text-2xl font-bold text-blue-700">
                            {summaryChart.izin}
                          </p>
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            Izin
                          </p>
                        </div>
                        <div className="bg-linear-to-br from-red-50 to-red-100/50 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200">
                          <p className="text-2xl font-bold text-red-700">
                            {summaryChart.alpa}
                          </p>
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            Alpa
                          </p>
                        </div>
                        <div className="bg-linear-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200 border-2 border-emerald-200/50">
                          <p className="text-2xl font-bold text-emerald-700">
                            {summaryChart.skor}%
                          </p>
                          <p className="text-xs text-emerald-600 mt-1 font-medium">
                            Skor
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {santri.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                <button
                  onClick={handleExportPDF}
                  className="bg-linear-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>{" "}
        </>
      )}

      {sudahCari && santri.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Belum ada data untuk periode ini
        </div>
      )}
    </div>
  );
}
