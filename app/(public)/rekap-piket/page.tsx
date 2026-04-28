"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    handleLihat();
  }, []);

  async function handleLihat() {
    setLoading(true);
    setSudahCari(false);

    const params = new URLSearchParams({ dariTanggal, sampaiTanggal });

    try {
      const res = await fetch(`/api/rekap-piket?${params}`);
      const data = await res.json();
      console.log("data:", data);
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
      judul === "Piket Makan"
        ? "makan"
        : judul === "Piket Asrama"
          ? "asrama"
          : "gabungan";
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-700">{judul}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">No</th>
                <th className="text-left px-4 py-3 text-gray-600">Nama</th>
                <th className="text-center px-4 py-3 text-green-600">Piket</th>
                <th className="text-center px-4 py-3 text-orange-600">Telat</th>
                <th className="text-center px-4 py-3 text-blue-600">Sakit</th>
                <th className="text-center px-4 py-3 text-yellow-600">Izin</th>
                <th className="text-center px-4 py-3 text-red-600">Alpa</th>
                <th className="text-center px-4 py-3 text-[#1a6b3c]">Skor</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, index) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                  <td className="px-4 py-3 font-medium">
                    {s.nama}
                    {s.isArchived && (
                      <span className="ml-2 text-xs text-gray-400">
                        (nonaktif)
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center text-green-600">
                    {s[key].hadir}
                  </td>

                  <td className="px-4 py-3 text-center text-orange-600">
                    {s[key].telat}
                  </td>

                  <td className="px-4 py-3 text-center text-blue-600">
                    {s[key].sakit}
                  </td>

                  <td className="px-4 py-3 text-center text-yellow-600">
                    {s[key].izin}
                  </td>

                  <td className="px-4 py-3 text-center text-red-600">
                    {s[key].alpa}
                  </td>

                  <td className="px-4 py-3 text-center font-medium text-[#1a6b3c]">
                    {s[key].skor}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Rekap Piket</h1>

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

      {/* Hasil */}
      {sudahCari && santri.length > 0 && (
        <>
          <div className="w-fit bg-white rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-700">
                Rekap {dariTanggal} s/d {sampaiTanggal}
              </h2>
            </div>
          </div>

          <TabelRekap data={santri} judul="Piket Makan" />
          <TabelRekap data={santri} judul="Piket Asrama" />
          <TabelRekap data={santri} judul="Rekap Keseluruhan" />

          <div className="my-6">
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
                      Ringkasan Tanggung Jawab Keseluruhan
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
          {/* Export */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {santri.length > 0 && (
              <div className="px-6 py-4 border-t flex gap-3">
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

      {sudahCari && santri.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Belum ada data untuk periode ini
        </div>
      )}
    </div>
  );
}
