"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusAbsen } from "@prisma/client";
import TabelSholat from "@/components/absen/TableSholat";
import TabelKelas from "@/components/absen/TableKelas";
import TabelMakan from "@/components/absen/TableMakan";
import TabelAsrama from "@/components/absen/TableAsrama";

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

export default function AbsenTanggalPage() {
  const { tanggal } = useParams();
  const router = useRouter();

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
  const [makanStates, setMakanStates] = useState<Record<string, StatusAbsen>>(
    {},
  );
  const [asramaStates, setAsramaStates] = useState<Record<string, StatusAbsen>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [sukses, setSukses] = useState<Record<string, boolean>>({});

  const tanggalDate = new Date(tanggal as string);
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
              const states: Record<string, StatusAbsen> = {};
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
              const states: Record<string, StatusAbsen> = {};
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

  async function handleSubmitSholat(calledFromSemua = false) {
    if (!absensiIds.SHOLAT) return;
    if (!calledFromSemua) setSubmitting("SHOLAT");

    try {
      const data = santriList.flatMap((s) =>
        WAKTU_SHOLAT.map((waktu) => ({
          santriId: s.id,
          waktu,
          status: sholatStates[`${s.id}-${waktu}`] || "KOSONG",
        })),
      );
      await fetch("/api/absen-sholat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absensiId: absensiIds.SHOLAT.id, data }),
      });
      if (!calledFromSemua) {
        setSukses((prev) => ({ ...prev, ASRAMA: true }));
        setTimeout(
          () => setSukses((prev) => ({ ...prev, ASRAMA: false })),
          3000,
        );
      }
    } finally {
      if (!calledFromSemua) setSubmitting(null);
    }
  }

  async function handleSubmitKelas(calledFromSemua = false) {
    if (!absensiIds.KELAS) return;
    if (!calledFromSemua) setSubmitting("KELAS");
    try {
      const data = santriList.flatMap((s) =>
        SESI_KELAS.map((sesi) => ({
          santriId: s.id,
          sesi,
          status: kelasStates[`${s.id}-${sesi}`] || "KOSONG",
        })),
      );
      await fetch("/api/absen-kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absensiId: absensiIds.KELAS.id, data }),
      });
      if (!calledFromSemua) {
        setSukses((prev) => ({ ...prev, ASRAMA: true }));
        setTimeout(
          () => setSukses((prev) => ({ ...prev, ASRAMA: false })),
          3000,
        );
      }
    } finally {
      if (!calledFromSemua) setSubmitting(null);
    }
  }

  async function handleSubmitMakan(calledFromSemua = false) {
    if (!absensiIds.MAKAN) return;
    if (!calledFromSemua) setSubmitting("MAKAN");
    try {
      const data = santriList.flatMap((s) =>
        SESI_MAKAN.map((sesi) => ({
          santriId: s.id,
          sesi,
          status: makanStates[`${s.id}-${sesi}`] || "KOSONG",
        })),
      );
      await fetch("/api/absen-makan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absensiId: absensiIds.MAKAN.id, data }),
      });
      if (!calledFromSemua) {
        setSukses((prev) => ({ ...prev, ASRAMA: true }));
        setTimeout(
          () => setSukses((prev) => ({ ...prev, ASRAMA: false })),
          3000,
        );
      }
    } finally {
      if (!calledFromSemua) setSubmitting(null);
    }
  }

  async function handleSubmitAsrama(calledFromSemua = false) {
    if (!absensiIds.ASRAMA) return;
    if (!calledFromSemua) setSubmitting("ASRAMA");
    try {
      const data = santriList.map((s) => ({
        santriId: s.id,
        status: asramaStates[`${s.id}`] || "KOSONG",
      }));
      await fetch("/api/absen-asrama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absensiId: absensiIds.ASRAMA.id, data }),
      });
      if (!calledFromSemua) {
        setSukses((prev) => ({ ...prev, ASRAMA: true }));
        setTimeout(
          () => setSukses((prev) => ({ ...prev, ASRAMA: false })),
          3000,
        );
      }
    } finally {
      if (!calledFromSemua) setSubmitting(null);
    }
  }

  async function handleSubmitSemua() {
    setSubmitting("SEMUA");
    try {
      await Promise.all([
        handleSubmitSholat(true),
        handleSubmitKelas(true),
        handleSubmitMakan(true),
        handleSubmitAsrama(true),
      ]);
      setSukses({ SHOLAT: true, KELAS: true, MAKAN: true, ASRAMA: true });
      setTimeout(() => setSukses({}), 3000);
    } finally {
      setSubmitting(null); // loading hilang SETELAH semua fetch selesai
    }
  }
  function handleTandaiSemua(
    checked: boolean,
    tipe: "SHOLAT" | "KELAS" | "MAKAN" | "ASRAMA",
  ) {
    if (tipe === "SHOLAT") {
      setSholatStates((prev) => {
        const newStates = { ...prev };
        santriList.forEach((santri) => {
          WAKTU_SHOLAT.forEach((waktu) => {
            const key = `${santri.id}-${waktu}`;
            if (checked) {
              if (!newStates[key] || newStates[key] === "KOSONG")
                newStates[key] = "HADIR";
            } else {
              if (newStates[key] === "HADIR") newStates[key] = null;
            }
          });
        });
        return newStates;
      });
    } else if (tipe === "KELAS") {
      setKelasStates((prev) => {
        const newStates = { ...prev };
        santriList.forEach((santri) => {
          SESI_KELAS.forEach((sesi) => {
            const key = `${santri.id}-${sesi}`;
            if (checked) {
              if (!newStates[key] || newStates[key] === "KOSONG")
                newStates[key] = "HADIR";
            } else {
              if (newStates[key] === "HADIR") newStates[key] = null;
            }
          });
        });
        return newStates;
      });
    } else if (tipe === "MAKAN") {
      setMakanStates((prev) => {
        const newStates = { ...prev };
        santriList.forEach((santri) => {
          SESI_MAKAN.forEach((sesi) => {
            const key = `${santri.id}-${sesi}`;
            if (checked) {
              if (!newStates[key] || newStates[key] === "KOSONG")
                newStates[key] = "HADIR";
            } else {
              if (newStates[key] === "HADIR") newStates[key] = "KOSONG";
            }
          });
        });
        return newStates;
      });
    } else if (tipe === "ASRAMA") {
      setAsramaStates((prev) => {
        const newStates = { ...prev };
        santriList.forEach((santri) => {
          const key = `${santri.id}`;
          if (checked) {
            if (!newStates[key] || newStates[key] === "KOSONG")
              newStates[key] = "HADIR";
          } else {
            if (newStates[key] === "HADIR") newStates[key] = "KOSONG";
          }
        });
        return newStates;
      });
    }
  }

  function pindahTanggal(arah: number) {
    const tgl = new Date(tanggal as string);
    tgl.setDate(tgl.getDate() + arah);
    const newTanggal = tgl.toISOString().split("T")[0];
    router.push(`/dashboard/absensi/tanggal/${newTanggal}`);
  }

  if (loading) return <div className="p-6 text-gray-500">Memuat data...</div>;

  return (
    <div>
      {/* Header + Navigasi Tanggal */}
      <div className="pt-5 sm:pt-15 md:pt-5 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Isi Absensi</h1>
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
              defaultValue={tanggal as string}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(
                    `/dashboard/absensi/tanggal/${(e.target as HTMLInputElement).value}`,
                  );
                }
              }}
              onBlur={(e) => {
                router.push(`/dashboard/absensi/tanggal/${e.target.value}`);
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

      {/* Submit Semua */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Submit Semua</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Submit semua absensi sekaligus
          </p>
        </div>
        <button
          onClick={handleSubmitSemua}
          disabled={submitting !== null}
          className="w-full sm:w-auto bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {submitting === "SEMUA" ? "Menyimpan..." : "Submit Semua"}
        </button>
      </div>
      {/* Section Sholat */}
      {absensiIds.SHOLAT ? (
        <TabelSholat
          santriList={santriList}
          sholatStates={sholatStates}
          submitting={submitting}
          sukses={sukses.SHOLAT ?? false}
          onTandaiSemua={(checked) => handleTandaiSemua(checked, "SHOLAT")}
          onStatusChange={(santriId, waktu, status) =>
            setSholatStates((prev) => ({
              ...prev,
              [`${santriId}-${waktu}`]: status,
            }))
          }
          onSubmit={() => handleSubmitSholat()}
        />
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          📿 Absen Sholat belum dibuat untuk tanggal ini
        </div>
      )}

      {/* Section Kelas */}
      {absensiIds.KELAS ? (
        <TabelKelas
          santriList={santriList}
          sesiKelas={SESI_KELAS}
          kelasStates={kelasStates}
          submitting={submitting}
          sukses={sukses.KELAS ?? false}
          onTandaiSemua={(checked) => handleTandaiSemua(checked, "KELAS")}
          onStatusChange={(santriId, sesi, status) =>
            setKelasStates((prev) => ({
              ...prev,
              [`${santriId}-${sesi}`]: status,
            }))
          }
          onSubmit={() => handleSubmitKelas()}
        />
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          📚 Absen Kelas belum dibuat untuk tanggal ini
        </div>
      )}

      {/* Section Makan */}
      {absensiIds.MAKAN ? (
        <TabelMakan
          santriList={santriList}
          sesiMakan={SESI_MAKAN}
          makanStates={makanStates}
          submitting={submitting}
          sukses={sukses.MAKAN ?? false}
          onTandaiSemua={(checked) => handleTandaiSemua(checked, "MAKAN")}
          onStatusChange={(santriId, sesi, status) =>
            setMakanStates((prev) => ({
              ...prev,
              [`${santriId}-${sesi}`]: status,
            }))
          }
          onSubmit={() => handleSubmitMakan()}
        />
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          🍽️ Piket Makan belum dibuat untuk tanggal ini
        </div>
      )}

      {/* Section Asrama */}
      {absensiIds.ASRAMA ? (
        <TabelAsrama
          santriList={santriList}
          asramaStates={asramaStates}
          submitting={submitting}
          sukses={sukses.ASRAMA ?? false}
          onTandaiSemua={(checked) => handleTandaiSemua(checked, "ASRAMA")}
          onStatusChange={(santriId, status) =>
            setAsramaStates((prev) => ({
              ...prev,
              [`${santriId}`]: status,
            }))
          }
          onSubmit={() => handleSubmitAsrama()}
        />
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          🏠 Piket Asrama belum dibuat untuk tanggal ini
        </div>
      )}
    </div>
  );
}
