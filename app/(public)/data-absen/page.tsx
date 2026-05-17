"use client";

import { useState, useEffect, useCallback } from "react";
import { StatusAbsen } from "@prisma/client";
import TabelSholatReadOnly from "@/components/absen/TableSholatReadOnly";
import TabelKelasReadOnly from "@/components/absen/TableKelasReadOnly";
import TabelMakanReadOnly from "@/components/absen/TableMakanReadOnly";
import TabelAsramaReadOnly from "@/components/absen/TableAsramaReadOnly";

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

export default function DataAbsenPage() {
  const [tanggal, setTanggal] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

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

  // untuk mengambil label hari dan tanggal
  const tanggalDate = new Date(tanggal);
  const namaHari = HARI[tanggalDate.getDay()];
  const labelTanggal = `${namaHari}, ${tanggalDate.getDate()} ${BULAN[tanggalDate.getMonth()]} ${tanggalDate.getFullYear()}`;

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

      // Fetch data yang sudah ada
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
    const newTanggal = tgl.toISOString().split("T")[0];
    setTanggal(newTanggal);
  }

  if (loading) return <div className="p-6 text-gray-500">Memuat data...</div>;

  return (
    <div>
      {/* Header + Navigasi Tanggal */}
      <div className="pt-5 sm:pt-15 md:pt-5 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Absensi</h1>
          <p className="text-gray-500 text-sm mt-1">{labelTanggal}</p>
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
                if (e.key === "Enter") {
                  setTanggal((e.target as HTMLInputElement).value);
                }
              }}
              onBlur={(e) => {
                setTanggal((e.target as HTMLInputElement).value);
              }}
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

      {absensiIds.SHOLAT &&
      absensiIds.KELAS &&
      absensiIds.MAKAN &&
      absensiIds.ASRAMA ? (
        <>
          <TabelSholatReadOnly
            santriList={santriList}
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
    </div>
  );
}
