"use client";

import { useState, useEffect, useCallback } from "react";
import { StatusAbsen } from "@prisma/client";
import TabelSholatReadOnly from "@/components/absen/TableSholatReadOnly";
import TabelKelasReadOnly from "@/components/absen/TableKelasReadOnly";
import TabelMakanReadOnly from "@/components/absen/TableMakanReadOnly";
import TabelAsramaReadOnly from "@/components/absen/TableAsramaReadOnly";
import ChartDataAbsen from "@/components/ChartDataAbsen";
import TableSkeleton from "@/components/skeleton/TabelSkeleton";

const WAKTU_SHOLAT = [
  "Subuh",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya",
  "Tahajjud",
];
const SESI_KELAS = ["Sesi 1", "Sesi 2", "Sesi 3", "Sesi 4", "Sesi 5", "Sesi 6"];
const SESI_MAKAN = ["Pagi", "Siang", "Sore"];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
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

type Santri = { id: number; nama: string };
type AbsensiIds = {
  SHOLAT: { id: number } | null;
  KELAS: { id: number } | null;
  MAKAN: { id: number } | null;
  ASRAMA: { id: number } | null;
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function buildDateString(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function generateDateRange(dari: string, sampai: string): string[] {
  const dates: string[] = [];
  const start = new Date(dari);
  const end = new Date(sampai);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${mm}-${dd}`);
  }
  return dates;
}

function formatChartLabel(tanggal: string): string {
  const date = new Date(tanggal);
  return `${date.getDate()} ${HARI_SINGKAT[date.getDay()]}`;
}

export default function DataAbsenPage() {
  const today = new Date();

  // ─── State tabel absensi ───────────────────────────────────────────────────
  const [tanggal, setTanggal] = useState<string>(
    () => today.toISOString().split("T")[0],
  );
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [absensiIds, setAbsensiIds] = useState<AbsensiIds>({
    SHOLAT: null,
    KELAS: null,
    MAKAN: null,
    ASRAMA: null,
  });
  const [sholatStates, setSholatStates] = useState<
    Record<string, StatusAbsen | null>
  >({});
  const [kelasStates, setKelasStates] = useState<
    Record<string, StatusAbsen | null>
  >({});
  const [makanStates, setMakanStates] = useState<
    Record<string, StatusAbsen | null>
  >({});
  const [asramaStates, setAsramaStates] = useState<
    Record<string, StatusAbsen | null>
  >({});
  const [loading, setLoading] = useState(true);

  // ─── State filter chart ────────────────────────────────────────────────────
  const [bulanChart, setBulanChart] = useState<number>(today.getMonth());
  const [tahunChart, setTahunChart] = useState<number>(today.getFullYear());
  const [tanggalDariChart, setTanggalDariChart] = useState<number>(1);
  const [tanggalSampaiChart, setTanggalSampaiChart] = useState<number>(
    getDaysInMonth(today.getFullYear(), today.getMonth()),
  );
  const [tipeAbsenChart, setTipeAbsenChart] = useState<
    "all" | "sholat" | "kelas" | "makan" | "asrama"
  >("all");
  const [chartData, setChartData] = useState<
    Array<{
      tanggal: string;
      label: string;
      hadir: number;
      izin: number;
      sakit: number;
      telat: number;
      alpa: number;
    }>
  >([]);
  const [loadingChart, setLoadingChart] = useState(false);

  // ─── Computed values ───────────────────────────────────────────────────────
  const tanggalDate = new Date(tanggal);
  const labelTanggal = `${HARI[tanggalDate.getDay()]}, ${tanggalDate.getDate()} ${BULAN[tanggalDate.getMonth()]} ${tanggalDate.getFullYear()}`;
  const maxHariBulanIni = getDaysInMonth(tahunChart, bulanChart);
  const tahunOptions = Array.from(
    { length: 6 },
    (_, i) => today.getFullYear() - 5 + i,
  );
  const dariTanggalStr = buildDateString(
    tahunChart,
    bulanChart,
    tanggalDariChart,
  );
  const sampaiTanggalStr = buildDateString(
    tahunChart,
    bulanChart,
    tanggalSampaiChart,
  );

  // ─── Handlers filter ──────────────────────────────────────────────────────
  function handleBulanChange(bulanBaru: number) {
    setBulanChart(bulanBaru);
    const maxHari = getDaysInMonth(tahunChart, bulanBaru);
    setTanggalDariChart(1);
    setTanggalSampaiChart(maxHari);
  }

  function handleTahunChange(tahunBaru: number) {
    setTahunChart(tahunBaru);
    const maxHari = getDaysInMonth(tahunBaru, bulanChart);
    setTanggalDariChart(1);
    setTanggalSampaiChart(maxHari);
  }

  function handleTanggalDariChange(dari: number) {
    setTanggalDariChart(dari);
    if (tanggalSampaiChart < dari) setTanggalSampaiChart(dari);
  }

  // ─── Fetch chart data (manual — hanya saat klik Cari) ─────────────────────
  const fetchChartData = useCallback(async () => {
    setLoadingChart(true);
    try {
      const res = await fetch(
        `/api/data-absen?dariTanggal=${dariTanggalStr}&sampaiTanggal=${sampaiTanggalStr}`,
      );
      const data = await res.json();

      if (data.santri && Array.isArray(data.santri)) {
        const aggregateByDate: Record<
          string,
          {
            hadir: number;
            izin: number;
            sakit: number;
            telat: number;
            alpa: number;
          }
        > = {};

        data.santri.forEach(
          (santri: {
            sholat: Array<{ status: string; tanggal?: string; date?: string }>;
            kelas: Array<{ status: string; tanggal?: string; date?: string }>;
            makan: Array<{ status: string; tanggal?: string; date?: string }>;
            asrama: Array<{ status: string; tanggal?: string; date?: string }>;
          }) => {
            const allAbsen = [
              ...(tipeAbsenChart === "all" || tipeAbsenChart === "sholat"
                ? santri.sholat
                : []),
              ...(tipeAbsenChart === "all" || tipeAbsenChart === "kelas"
                ? santri.kelas
                : []),
              ...(tipeAbsenChart === "all" || tipeAbsenChart === "makan"
                ? santri.makan
                : []),
              ...(tipeAbsenChart === "all" || tipeAbsenChart === "asrama"
                ? santri.asrama
                : []),
            ];

            allAbsen.forEach((absen) => {
              let absenDate = absen.tanggal || absen.date;
              if (typeof absenDate === "string" && absenDate.includes("T")) {
                absenDate = absenDate.split("T")[0];
              }
              if (!absenDate) return;

              if (!aggregateByDate[absenDate]) {
                aggregateByDate[absenDate] = {
                  hadir: 0,
                  izin: 0,
                  sakit: 0,
                  telat: 0,
                  alpa: 0,
                };
              }

              if (absen.status === "HADIR")
                aggregateByDate[absenDate].hadir += 1;
              else if (absen.status === "IZIN")
                aggregateByDate[absenDate].izin += 1;
              else if (absen.status === "SAKIT")
                aggregateByDate[absenDate].sakit += 1;
              else if (absen.status === "TELAT")
                aggregateByDate[absenDate].telat += 1;
              else if (absen.status === "ALPA")
                aggregateByDate[absenDate].alpa += 1;
            });
          },
        );

        const allDates = generateDateRange(dariTanggalStr, sampaiTanggalStr);

        const sortedData = allDates
          .map((tgl) => ({
            tanggal: tgl,
            label: formatChartLabel(tgl),
            hadir: aggregateByDate[tgl]?.hadir || 0,
            izin: aggregateByDate[tgl]?.izin || 0,
            sakit: aggregateByDate[tgl]?.sakit || 0,
            telat: aggregateByDate[tgl]?.telat || 0,
            alpa: aggregateByDate[tgl]?.alpa || 0,
          }))
          .sort(
            (a, b) =>
              new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
          );
        setChartData(sortedData);
      }
    } catch (error) {
      console.error("Gagal fetch chart data:", error);
    } finally {
      setLoadingChart(false);
    }
  }, [dariTanggalStr, sampaiTanggalStr, tipeAbsenChart]);

  // ─── Fetch tabel absensi (otomatis saat tanggal berubah) ──────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [absensiRes, santriRes] = await Promise.all([
        fetch(`/api/absensi/tanggal/${tanggal}`),
        fetch("/api/santri"),
      ]);

      const absensiData = await absensiRes.json();
      const santriData = await santriRes.json();

      setAbsensiIds(absensiData);
      setSantriList(santriData);

      const fetches = [];

      if (absensiData.SHOLAT) {
        fetches.push(
          fetch(`/api/absen-sholat?absensiId=${absensiData.SHOLAT.id}`)
            .then((r) => r.json())
            .then((d) => {
              const states: Record<string, StatusAbsen | null> = {};
              d.forEach(
                (item: {
                  santriId: number;
                  waktu: string;
                  status: StatusAbsen;
                }) => {
                  states[`${item.santriId}-${item.waktu}`] = item.status;
                },
              );
              setSholatStates(states);
            }),
        );
      }

      if (absensiData.KELAS) {
        fetches.push(
          fetch(`/api/absen-kelas?absensiId=${absensiData.KELAS.id}`)
            .then((r) => r.json())
            .then((d) => {
              const states: Record<string, StatusAbsen | null> = {};
              d.forEach(
                (item: {
                  santriId: number;
                  sesi: string;
                  status: StatusAbsen;
                }) => {
                  states[`${item.santriId}-${item.sesi}`] = item.status;
                },
              );
              setKelasStates(states);
            }),
        );
      }

      if (absensiData.MAKAN) {
        fetches.push(
          fetch(`/api/absen-makan?absensiId=${absensiData.MAKAN.id}`)
            .then((r) => r.json())
            .then((d) => {
              const states: Record<string, StatusAbsen | null> = {};
              santriData.forEach((s: Santri) => {
                SESI_MAKAN.forEach((sesi) => {
                  states[`${s.id}-${sesi}`] = "KOSONG";
                });
              });
              d.forEach(
                (item: {
                  santriId: number;
                  sesi: string;
                  status: StatusAbsen;
                }) => {
                  states[`${item.santriId}-${item.sesi}`] = item.status;
                },
              );
              setMakanStates(states);
            }),
        );
      }

      if (absensiData.ASRAMA) {
        fetches.push(
          fetch(`/api/absen-asrama?absensiId=${absensiData.ASRAMA.id}`)
            .then((r) => r.json())
            .then((d) => {
              const states: Record<string, StatusAbsen | null> = {};
              santriData.forEach((s: Santri) => {
                states[`${s.id}`] = "KOSONG";
              });
              d.forEach((item: { santriId: number; status: StatusAbsen }) => {
                states[`${item.santriId}`] = item.status;
              });
              setAsramaStates(states);
            }),
        );
      }

      await Promise.all(fetches);
    } catch {
      console.error("Gagal fetch data");
    } finally {
      setLoading(false);
    }
  }, [tanggal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function pindahTanggal(arah: number) {
    const tgl = new Date(tanggal);
    tgl.setDate(tgl.getDate() + arah);
    setTanggal(tgl.toISOString().split("T")[0]);
  }

  return (
    <div>
      {loading && (
        <div className="fixed bottom-5 right-5 z-50 bg-black text-white px-4 py-2 rounded-xl shadow-lg">
          Memuat data...
        </div>
      )}

      {/* ── Chart Section ─────────────────────────────────────────────────── */}
      <div className="pt-5 sm:pt-15 md:pt-5 mb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Grafik Absensi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Analisis tren kehadiran santri berdasarkan periode dan tipe absensi
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-5 mb-6 transition-all duration-200">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              Filter Data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Bulan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">
                Bulan
              </label>
              <select
                value={bulanChart}
                onChange={(e) => handleBulanChange(Number(e.target.value))}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
              >
                {BULAN.map((nama, idx) => (
                  <option key={idx} value={idx}>
                    {nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">
                Tahun
              </label>
              <select
                value={tahunChart}
                onChange={(e) => handleTahunChange(Number(e.target.value))}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
              >
                {tahunOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Dari */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">
                Dari Tanggal
              </label>
              <select
                value={tanggalDariChart}
                onChange={(e) =>
                  handleTanggalDariChange(Number(e.target.value))
                }
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
              >
                {Array.from({ length: maxHariBulanIni }, (_, i) => i + 1).map(
                  (tgl) => (
                    <option key={tgl} value={tgl}>
                      {tgl}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Tanggal Sampai */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">
                Sampai Tanggal
              </label>
              <select
                value={tanggalSampaiChart}
                onChange={(e) => setTanggalSampaiChart(Number(e.target.value))}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
              >
                {Array.from({ length: maxHariBulanIni }, (_, i) => i + 1)
                  .filter((tgl) => tgl >= tanggalDariChart)
                  .map((tgl) => (
                    <option key={tgl} value={tgl}>
                      {tgl}
                    </option>
                  ))}
              </select>
            </div>

            {/* Tipe Absensi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">
                Tipe Absensi
              </label>
              <select
                value={tipeAbsenChart}
                onChange={(e) =>
                  setTipeAbsenChart(
                    e.target.value as
                      | "all"
                      | "sholat"
                      | "kelas"
                      | "makan"
                      | "asrama",
                  )
                }
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
              >
                <option value="all">Semua Tipe</option>
                <option value="sholat">Sholat</option>
                <option value="kelas">Kelas</option>
                <option value="makan">Makan</option>
                <option value="asrama">Asrama</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-xs font-medium text-emerald-700">
                Menampilkan data:{" "}
                <span className="font-bold">
                  {tanggalDariChart} {BULAN[bulanChart]} {tahunChart} —{" "}
                  {tanggalSampaiChart} {BULAN[bulanChart]} {tahunChart}
                </span>{" "}
                ({tanggalSampaiChart - tanggalDariChart + 1} hari)
              </p>
            </div>

            <button
              onClick={fetchChartData}
              disabled={loadingChart}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-400 disabled:to-emerald-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loadingChart ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memuat...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    />
                  </svg>
                  Tampilkan Grafik
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chart Area */}
        {loadingChart ? (
          <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-8 flex flex-col items-center justify-center gap-4 min-h-80">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">
                Memuat Grafik
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Sedang mengambil data...
              </p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="transform transition-all duration-500 animate-fadeInUp">
            <ChartDataAbsen data={chartData} />
          </div>
        ) : (
          <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Belum Ada Data
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Atur filter di atas lalu klik{" "}
                  <strong className="text-emerald-600">Tampilkan Grafik</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mb-8">
        <div className="border-t border-gray-100"></div>
      </div>

      {/* ── Header + Navigasi Tanggal ──────────────────────────────────────── */}
      <div className="pt-5 sm:pt-15 md:pt-5 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Absensi</h1>
          <p className="text-gray-500 text-sm mt-1">{labelTanggal}</p>
          <div className="w-25 h-1 bg-emerald-500 rounded-full mt-2"></div>
        </div>
        <div className="flex flex-col gap-1 w-fit">
          <label className="text-xs font-medium text-gray-500 px-1">
            Pilih Tanggal
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pindahTanggal(-1)}
              className="hidden sm:flex px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              ←
            </button>
            <input
              type="date"
              defaultValue={tanggal}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  setTanggal((e.target as HTMLInputElement).value);
              }}
              onBlur={(e) => setTanggal((e.target as HTMLInputElement).value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
            />
            <button
              onClick={() => pindahTanggal(1)}
              className="hidden sm:flex px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabel Absensi ─────────────────────────────────────────────────── */}
      {loading ? (
        <>
          <TableSkeleton title="Absen Sholat" columns={WAKTU_SHOLAT} />

          <TableSkeleton title="Absen Kelas" columns={SESI_KELAS} />

          <TableSkeleton title="Absen Makan" columns={SESI_MAKAN} />

          <TableSkeleton title="Absen Asrama" columns={["Status"]} />
        </>
      ) : (
        <>
          {absensiIds.SHOLAT &&
          absensiIds.KELAS &&
          absensiIds.MAKAN &&
          absensiIds.ASRAMA ? (
            <>
              <TabelSholatReadOnly
                santriList={santriList}
                waktuSholat={WAKTU_SHOLAT}
                sholatStates={sholatStates}
              />
              <TabelKelasReadOnly
                santriList={santriList}
                sesiKelas={SESI_KELAS}
                kelasStates={kelasStates}
              />
              <TabelMakanReadOnly
                santriList={santriList}
                sesiMakan={SESI_MAKAN}
                makanStates={makanStates}
              />
              <TabelAsramaReadOnly
                santriList={santriList}
                asramaStates={asramaStates}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 bg-white border border-dashed border-gray-200 rounded-xl min-h-[calc(100vh-200px)]">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
              <p className="text-sm font-medium text-gray-400">
                Belum ada data absensi
              </p>
              <p className="text-xs text-gray-300">
                Data absensi untuk tanggal ini belum dibuat
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
