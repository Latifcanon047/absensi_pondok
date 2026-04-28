"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusAbsen } from "@prisma/client";
import StatusPicker from "@/components/absen/StatusPicker";

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

const STATUS_PIKET_CONFIG = {
  HADIR: { bg: "bg-green-100", text: "text-green-700", label: "Piket" },
  ALPA: { bg: "bg-red-100", text: "text-red-700", label: "A Alpa" },
  KOSONG: { bg: "bg-gray-100", text: "text-gray-400", label: "-" },
  SAKIT: { bg: "bg-yellow-100", text: "text-yellow-700", label: "S Sakit" },
  IZIN: { bg: "bg-blue-100", text: "text-blue-700", label: "I Izin" },
};

type StatusPiket = "HADIR" | "ALPA" | "KOSONG" | "SAKIT" | "IZIN";

function StatusPickerPiket({
  currentStatus,
  onChange,
  disabled,
}: {
  currentStatus: StatusPiket;
  onChange: (status: StatusPiket) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const config = STATUS_PIKET_CONFIG[currentStatus];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text} disabled:opacity-50`}
      >
        {config.label}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-24">
          {(["HADIR", "ALPA", "SAKIT", "IZIN", "KOSONG"] as StatusPiket[]).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-gray-50"
              >
                <span className={STATUS_PIKET_CONFIG[s].text}>
                  {STATUS_PIKET_CONFIG[s].label}
                </span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

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
  const [makanStates, setMakanStates] = useState<Record<string, StatusPiket>>(
    {},
  );
  const [asramaStates, setAsramaStates] = useState<Record<string, StatusPiket>>(
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
              const states: Record<string, StatusPiket> = {};
              santriData.forEach((s: Santri) => {
                SESI_MAKAN.forEach((sesi) => {
                  states[`${s.id}-${sesi}`] = "KOSONG";
                });
              });
              d.forEach(
                (item: {
                  santriId: number;
                  sesi: string;
                  status: StatusPiket;
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
              const states: Record<string, StatusPiket> = {};
              santriData.forEach((s: Santri) => {
                states[`${s.id}`] = "KOSONG";
              });
              d.forEach((item: { santriId: number; status: StatusPiket }) => {
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
    const tgl = new Date(tanggal as string);
    tgl.setDate(tgl.getDate() + arah);
    const newTanggal = tgl.toISOString().split("T")[0];
    router.push(`/dashboard/absensi/tanggal/${newTanggal}`);
  }

  async function handleSubmitSholat() {
    if (!absensiIds.SHOLAT) return;
    setSubmitting("SHOLAT");
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
      setSukses((prev) => ({ ...prev, SHOLAT: true }));
      setTimeout(() => setSukses((prev) => ({ ...prev, SHOLAT: false })), 3000);
    } finally {
      setSubmitting(null);
    }
  }

  async function handleSubmitKelas() {
    if (!absensiIds.KELAS) return;
    setSubmitting("KELAS");
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
      setSukses((prev) => ({ ...prev, KELAS: true }));
      setTimeout(() => setSukses((prev) => ({ ...prev, KELAS: false })), 3000);
    } finally {
      setSubmitting(null);
    }
  }

  async function handleSubmitMakan() {
    if (!absensiIds.MAKAN) return;
    setSubmitting("MAKAN");
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
      setSukses((prev) => ({ ...prev, MAKAN: true }));
      setTimeout(() => setSukses((prev) => ({ ...prev, MAKAN: false })), 3000);
    } finally {
      setSubmitting(null);
    }
  }

  async function handleSubmitAsrama() {
    if (!absensiIds.ASRAMA) return;
    setSubmitting("ASRAMA");
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
      setSukses((prev) => ({ ...prev, ASRAMA: true }));
      setTimeout(() => setSukses((prev) => ({ ...prev, ASRAMA: false })), 3000);
    } finally {
      setSubmitting(null);
    }
  }

  async function handleSubmitSemua() {
    setSubmitting("SEMUA");
    await Promise.all([
      handleSubmitSholat(),
      handleSubmitKelas(),
      handleSubmitMakan(),
      handleSubmitAsrama(),
    ]);
    setSubmitting(null);
    setSukses({ SHOLAT: true, KELAS: true, MAKAN: true, ASRAMA: true });
    setTimeout(() => setSukses({}), 3000);
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

  if (loading) return <div className="p-6 text-gray-500">Memuat data...</div>;

  return (
    <div>
      {/* Header + Navigasi Tanggal */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Isi Absensi</h1>
          <p className="text-gray-500 text-sm mt-1">{labelTanggal}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => pindahTanggal(-1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            ← Kemarin
          </button>
          <button
            onClick={() => pindahTanggal(1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Besok →
          </button>
        </div>
      </div>

      {/* Submit Semua */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">Submit semua absensi sekaligus</p>
        <button
          onClick={handleSubmitSemua}
          disabled={submitting !== null}
          className="bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          {submitting === "SEMUA" ? "Menyimpan..." : "✅ Submit Semua"}
        </button>
      </div>

      {/* Section Sholat */}
      {absensiIds.SHOLAT ? (
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">📿 Absen Sholat</h2>{" "}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 me-5 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleTandaiSemua(e.target.checked, "SHOLAT")
                  }
                  className="w-4 h-4 accent-[#1a6b3c] cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  Tandai Semua Hadir
                </span>
              </label>
              {sukses.SHOLAT && (
                <span className="text-green-600 text-sm">✅ Tersimpan!</span>
              )}
              <button
                onClick={handleSubmitSholat}
                disabled={submitting !== null}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {submitting === "SHOLAT" ? "..." : "Submit"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-gray-600 font-medium border-b border-r min-w-40">
                    Nama
                  </th>
                  {WAKTU_SHOLAT.map((w) => (
                    <th
                      key={w}
                      className="px-4 py-3 text-center text-gray-600 font-medium border-b min-w-24"
                    >
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {santriList.map((santri, index) => (
                  <tr
                    key={santri.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="sticky left-0 bg-inherit px-4 py-3 font-medium border-r border-b">
                      {santri.nama}
                    </td>
                    {WAKTU_SHOLAT.map((waktu) => (
                      <td
                        key={waktu}
                        className="px-4 py-3 text-center border-b"
                      >
                        <StatusPicker
                          currentStatus={
                            sholatStates[`${santri.id}-${waktu}`] ?? null
                          }
                          onChange={(s) =>
                            setSholatStates((prev) => ({
                              ...prev,
                              [`${santri.id}-${waktu}`]: s,
                            }))
                          }
                          disabled={submitting !== null}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <div className="h-37" />
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          📿 Absen Sholat belum dibuat untuk tanggal ini
        </div>
      )}

      {/* Section Kelas */}
      {absensiIds.KELAS ? (
        <div className="bg-white rounded-xl shadow-sm mb-6">
          ``
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">📚 Absen Kelas</h2>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 me-5 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={(e) => handleTandaiSemua(e.target.checked, "KELAS")}
                  className="w-4 h-4 accent-[#1a6b3c] cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  Tandai Semua Hadir
                </span>
              </label>

              {sukses.KELAS && (
                <span className="text-green-600 text-sm">✅ Tersimpan!</span>
              )}
              <button
                onClick={handleSubmitKelas}
                disabled={submitting !== null}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {submitting === "KELAS" ? "..." : "Submit"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-gray-600 font-medium border-b border-r min-w-40">
                    Nama
                  </th>
                  {SESI_KELAS.map((s) => (
                    <th
                      key={s}
                      className="px-4 py-3 text-center text-gray-600 font-medium border-b min-w-24"
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {santriList.map((santri, index) => (
                  <tr
                    key={santri.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="sticky left-0 bg-inherit px-4 py-3 font-medium border-r border-b">
                      {santri.nama}
                    </td>
                    {SESI_KELAS.map((sesi) => (
                      <td key={sesi} className="px-4 py-3 text-center border-b">
                        <StatusPicker
                          currentStatus={
                            kelasStates[`${santri.id}-${sesi}`] ?? null
                          }
                          onChange={(s) =>
                            setKelasStates((prev) => ({
                              ...prev,
                              [`${santri.id}-${sesi}`]: s,
                            }))
                          }
                          disabled={submitting !== null}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <div className="h-37" />
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          📚 Absen Kelas belum dibuat untuk tanggal ini
        </div>
      )}

      {/* Section Makan */}
      {absensiIds.MAKAN ? (
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">🍽️ Piket Makan</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 me-5 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={(e) => handleTandaiSemua(e.target.checked, "MAKAN")}
                  className="w-4 h-4 accent-[#1a6b3c] cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  Tandai Semua Hadir
                </span>
              </label>

              {sukses.MAKAN && (
                <span className="text-green-600 text-sm">✅ Tersimpan!</span>
              )}
              <button
                onClick={handleSubmitMakan}
                disabled={submitting !== null}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {submitting === "MAKAN" ? "..." : "Submit"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-gray-600 font-medium border-b border-r min-w-40">
                    Nama
                  </th>
                  {SESI_MAKAN.map((s) => (
                    <th
                      key={s}
                      className="px-4 py-3 text-center text-gray-600 font-medium border-b min-w-24"
                    >
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {santriList.map((santri, index) => (
                  <tr
                    key={santri.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="sticky left-0 bg-inherit px-4 py-3 font-medium border-r border-b">
                      {santri.nama}
                    </td>
                    {SESI_MAKAN.map((sesi) => (
                      <td key={sesi} className="px-4 py-3 text-center border-b">
                        <StatusPickerPiket
                          currentStatus={
                            makanStates[`${santri.id}-${sesi}`] || "KOSONG"
                          }
                          onChange={(s) =>
                            setMakanStates((prev) => ({
                              ...prev,
                              [`${santri.id}-${sesi}`]: s,
                            }))
                          }
                          disabled={submitting !== null}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <div className="h-37" />
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          🍽️ Piket Makan belum dibuat untuk tanggal ini
        </div>
      )}

      {/* Section Asrama */}
      {absensiIds.ASRAMA ? (
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">🏠 Piket Asrama</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 me-5 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    handleTandaiSemua(e.target.checked, "ASRAMA")
                  }
                  className="w-4 h-4 accent-[#1a6b3c] cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  Tandai Semua Hadir
                </span>
              </label>

              {sukses.ASRAMA && (
                <span className="text-green-600 text-sm">✅ Tersimpan!</span>
              )}
              <button
                onClick={handleSubmitAsrama}
                disabled={submitting !== null}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {submitting === "ASRAMA" ? "..." : "Submit"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-600 font-medium border-b">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium border-b">
                    Piket
                  </th>
                </tr>
              </thead>
              <tbody>
                {santriList.map((santri, index) => (
                  <tr
                    key={santri.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="px-4 py-3 font-medium border-b">
                      {santri.nama}
                    </td>
                    <td className="px-4 py-3 text-center border-b">
                      <StatusPickerPiket
                        currentStatus={asramaStates[`${santri.id}`] || "KOSONG"}
                        onChange={(s) =>
                          setAsramaStates((prev) => ({
                            ...prev,
                            [`${santri.id}`]: s,
                          }))
                        }
                        disabled={submitting !== null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <div className="h-37" />
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center text-gray-400 text-sm">
          🏠 Piket Asrama belum dibuat untuk tanggal ini
        </div>
      )}
    </div>
  );
}
