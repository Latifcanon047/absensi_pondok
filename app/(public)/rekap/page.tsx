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
  const [hasil, setHasil] = useState<RekapSantri[]>([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [summaryChart, setSummaryChart] = useState<Summary | null>(null);

  function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function handleLihatRekap() {
    setLoading(true);
    setSudahCari(false);

    const params = new URLSearchParams({
      dariTanggal,
      sampaiTanggal,
    });

    try {
      const [res, resChart] = await Promise.all([
        fetch(`/api/rekap?${params}`),
        fetch(`/api/chart?${params}`),
      ]);

      const [data, dataChart] = await Promise.all([
        res.json(),
        resChart.json(),
      ]);
      setHasil(data);
      setChartData(dataChart);
      setSummaryChart(dataChart.summary);
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
    XLSX.writeFile(wb, `Rekap Absen ${dariTanggal} sd ${sampaiTanggal}.xlsx`);
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Warna tema
    const primaryColor: [number, number, number] = [26, 107, 60];
    const secondaryColor: [number, number, number] = [240, 250, 244];

    // Margin kiri-kanan yang konsisten
    const marginLeft = 14;
    const marginRight = 196; // 210 - 14
    const pageWidth = 210;
    const contentWidth = pageWidth - marginLeft * 2;

    // ========== HEADER ==========
    // Garis atas
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 5, "F");

    // Judul utama - RATA TENGAH
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN REKAP ABSEN", pageWidth / 2, 25, { align: "center" });

    // Periode - RATA TENGAH
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Periode: ${formatTanggalIndonesia(dariTanggal)} s/d ${formatTanggalIndonesia(sampaiTanggal)}`,
      pageWidth / 2,
      35,
      { align: "center" },
    );

    // Garis pemisah
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, 42, marginRight, 42);

    // ========== TABEL REKAP SANTRI ==========
    autoTable(doc, {
      startY: 50,
      head: [
        [
          {
            content: "No",
            styles: { halign: "center" as const, cellWidth: 12 },
          },
          {
            content: "Nama Santri",
            styles: { halign: "left" as const, cellWidth: 65 },
          },
          {
            content: "Hadir",
            styles: { halign: "center" as const, cellWidth: 18 },
          },
          {
            content: "Telat",
            styles: { halign: "center" as const, cellWidth: 18 },
          },
          {
            content: "Sakit",
            styles: { halign: "center" as const, cellWidth: 18 },
          },
          {
            content: "Izin",
            styles: { halign: "center" as const, cellWidth: 18 },
          },
          {
            content: "Alpa",
            styles: { halign: "center" as const, cellWidth: 18 },
          },
          {
            content: "Skor",
            styles: { halign: "center" as const, cellWidth: 23 },
          },
        ],
      ],
      body: hasil.map((santri, index) => [
        { content: index + 1, styles: { halign: "center" as const } },
        {
          content: santri.nama + (santri.isArchived ? " (Nonaktif)" : ""),
          styles: { halign: "left" as const },
        },
        {
          content: santri.hadir,
          styles: { halign: "center" as const, textColor: [22, 163, 74] },
        },
        {
          content: santri.telat,
          styles: { halign: "center" as const, textColor: [234, 88, 12] },
        },
        {
          content: santri.sakit,
          styles: { halign: "center" as const, textColor: [217, 119, 6] },
        },
        {
          content: santri.izin,
          styles: { halign: "center" as const, textColor: [37, 99, 235] },
        },
        {
          content: santri.alpa,
          styles: { halign: "center" as const, textColor: [220, 38, 38] },
        },
        {
          content: `${santri.skor}%`,
          styles: {
            halign: "center" as const,
            textColor: primaryColor,
            fontStyle: "bold",
          },
        },
      ]),
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: "bold",
        halign: "center" as const,
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: secondaryColor,
      },
      margin: { left: marginLeft, right: marginLeft },
      tableWidth: contentWidth,
    });

    const lastAutoTable = (doc as any).lastAutoTable;
    let finalY = lastAutoTable ? lastAutoTable.finalY + 20 : 100;

    // ========== RINGKASAN STATISTIK ==========
    if (summaryChart) {
      // Cek halaman baru
      if (finalY > 240) {
        doc.addPage();
        finalY = 20;
      }

      // Judul section - RATA TENGAH
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("RINGKASAN KEDISIPLINAN KESELURUHAN", pageWidth / 2, finalY, {
        align: "center",
      });

      finalY += 8;

      // Garis bawah judul
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      const titleWidth = 50;
      doc.line(
        pageWidth / 2 - titleWidth / 2,
        finalY - 2,
        pageWidth / 2 + titleWidth / 2,
        finalY - 2,
      );

      finalY += 8;

      // Data statistik dalam format baris yang rapi
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

      // Tampilkan dalam 2 baris, masing-masing 3 kolom
      const cardW = contentWidth / 6 - 3; // 16 adalah jarak antar card
      const startX = marginLeft;

      statsData.forEach((stat, i) => {
        const xPos = startX + i * (cardW + 3.6);
        const yPos = finalY + 8;

        // Background berwarna
        doc.setFillColor(stat.bg[0], stat.bg[1], stat.bg[2]);
        doc.roundedRect(xPos, yPos, cardW, 28, 3, 3, "F");

        // Border tipis
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.roundedRect(xPos, yPos, cardW, 28, 3, 3, "S");

        // Label
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(stat.label, xPos + cardW / 2, yPos + 9, { align: "center" });

        // Value
        doc.setFontSize(13);
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setFont("helvetica", "bold");
        doc.text(String(stat.value), xPos + cardW / 2, yPos + 22, {
          align: "center",
        });
      });
    }

    // ========== FOOTER ==========
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Garis footer
      doc.setDrawColor(200, 200, 200);
      doc.line(marginLeft, 280, marginRight, 280);

      // Teks footer kiri
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
      doc.text(`Dicetak: ${formattedDate}`, marginLeft, 288);

      // Teks footer kanan
      doc.text(`Hal. ${i} dari ${pageCount}`, marginRight, 288, {
        align: "right",
      });

      // Teks footer tengah
      doc.text("Pondok Pesantren", pageWidth / 2, 288, { align: "center" });
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Rekap Absen</h1>

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
          onClick={handleLihatRekap}
          disabled={loading}
          className="bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {loading ? "Memuat..." : "Lihat Rekap"}
        </button>
      </div>

      {/* Tabel Hasil */}
      {sudahCari && (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-700">
                Rekap {dariTanggal} s/d {sampaiTanggal}
              </h2>
            </div>
            {hasil.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                Belum ada data untuk periode ini
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600">No</th>
                      <th className="text-left px-4 py-3 text-gray-600">
                        Nama
                      </th>
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
                      <th className="text-center px-4 py-3 text-red-600">
                        Alpa
                      </th>
                      <th className="text-center px-4 py-3 text-[#1a6b3c]">
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
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              📈 Chart Keseluruhan
            </h1>

            {sudahCari && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="font-semibold text-gray-700 mb-4">
                    Grafik Absensi
                  </h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={[
                        {
                          name: "Hadir",
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
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="jumlah" name="Jumlah" radius={[6, 6, 0, 0]}>
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

                {summaryChart && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-semibold text-gray-700 mb-4">
                      Ringkasan Kedisiplinan Keseluruhan
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {summaryChart.hadir}
                        </p>
                        <p className="text-xs text-green-700 mt-1">Hadir</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {summaryChart.telat}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">Telat</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {summaryChart.sakit}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">Sakit</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {summaryChart.izin}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">Izin</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {summaryChart.alpa}
                        </p>
                        <p className="text-xs text-red-700 mt-1">Alpa</p>
                      </div>
                      <div className="bg-[#1a6b3c]/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-[#1a6b3c]">
                          {summaryChart.skor}%
                        </p>
                        <p className="text-xs text-[#1a6b3c] mt-1">Skor</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {hasil.length > 0 && (
              <div className="px-6 py-4 border-t flex gap-3">
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
        </>
      )}
    </div>
  );
}
