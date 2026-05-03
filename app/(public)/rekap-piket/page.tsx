"use client";

import { useState, useEffect } from "react";
import SkeletonRekap from "@/components/skeleton/SkeletonRekap";
import FilterRekap from "@/components/rekap/FilterRekap";
import RekapTable from "@/components/rekap/RekapTable";
import GrafikAbsensi from "@/components/rekap/GrafikAbsensi";
import SummaryCards from "@/components/rekap/SummaryCards";
import { exportRekapPDF } from "@/lib/exportRekapPDF";

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
  sholat: RekapItem;
  kelas: RekapItem;
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
  const [hasil, setHasil] = useState<RekapSantri[]>([]);
  const [loading, setLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);
  const [summaryChart, setSummaryChart] = useState<Summary | null>(null);

  function formatDateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  async function handleLihatRekap() {
    setLoading(true);
    setSudahCari(false);

    const params = new URLSearchParams({ dariTanggal, sampaiTanggal });

    try {
      const res = await fetch(`/api/rekap-piket?${params}`);
      const data = await res.json();
      console.log(data);
      setHasil(data.santri); // untuk tabel rekap
      setSummaryChart(data.summary); // untuk chart
      setSudahCari(true);
    } catch {
      console.error("Gagal fetch rekap piket");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDFPiket() {
    await exportRekapPDF(dariTanggal, sampaiTanggal, hasil, summaryChart, {
      judul: "LAPORAN REKAP PIKET",
      judulRingkasan: "RINGKASAN TANGGUNG JAWAB KESELURUHAN",
      sections: [
        { title: "Piket Makan", key: "makan" },
        { title: "Piket Asrama", key: "asrama" },
        { title: "Rekap Keseluruhan Piket", key: "gabungan" },
      ],
    });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        Rekap Piket
      </h1>
      <p className="text-gray-500 text-sm mb-6 border-l-2 border-blue-400 pl-3">
        Lihat dan analisis data piket hasil
      </p>

      {/* Filter */}
      <FilterRekap
        dariTanggal={dariTanggal}
        sampaiTanggal={sampaiTanggal}
        loading={loading}
        onDariTanggalChange={setDariTanggal}
        onSampaiTanggalChange={setSampaiTanggal}
        onLihatRekap={handleLihatRekap}
      />

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
          <RekapTable data={hasil} judul="Piket Makan" />
          <RekapTable data={hasil} judul="Piket Asrama" />
          <RekapTable data={hasil} judul="Rekap Keseluruhan" />
          <div className="my-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Chart Keseluruhan
              </h1>
              <div className="w-12 h-1 bg-emerald-500 rounded-full mt-2"></div>
            </div>

            {summaryChart && (
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
                  <div className="p-6 overflow-hidden">
                    <GrafikAbsensi summaryChart={summaryChart} />
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
                      <SummaryCards
                        summaryChart={summaryChart}
                        labels={{ hadir: "Piket" }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {hasil.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                <button
                  onClick={handleExportPDFPiket}
                  className="bg-linear-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>{" "}
        </>
      )}

      {sudahCari && hasil.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Belum ada data untuk periode ini
        </div>
      )}
    </div>
  );
}
