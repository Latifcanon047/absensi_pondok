"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusAbsen } from "@prisma/client";
import StatusPicker from "@/components/absen/StatusPicker";

const SESI_KELAS = ["Sesi 1", "Sesi 2", "Sesi 3", "Sesi 4", "Sesi 5", "Sesi 6"];
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
type Absensi = { id: number; tanggal: string };

export default function AbsenKelasPage() {
  const { id } = useParams();
  const router = useRouter();

  const [absensi, setAbsensi] = useState<Absensi | null>(null);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [cellStates, setCellStates] = useState<
    Record<string, StatusAbsen | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [absensiRes, santriRes, absenKelasRes] = await Promise.all([
          fetch(`/api/absensi/${id}`),
          fetch("/api/santri"),
          fetch(`/api/absen-kelas?absensiId=${id}`),
        ]);

        const absensiData = await absensiRes.json();
        const santriData = await santriRes.json();
        const absenKelasData = await absenKelasRes.json();

        setAbsensi(absensiData);
        setSantriList(santriData);

        const initialStates: Record<string, StatusAbsen | null> = {};
        absenKelasData.forEach(
          (item: { santriId: number; sesi: string; status: StatusAbsen }) => {
            initialStates[`${item.santriId}-${item.sesi}`] = item.status;
          },
        );
        setCellStates(initialStates);
      } catch {
        console.error("Gagal fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function handleStatusChange(
    santriId: number,
    sesi: string,
    status: StatusAbsen,
  ) {
    setCellStates((prev) => ({
      ...prev,
      [`${santriId}-${sesi}`]: status,
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      const data = santriList.flatMap((santri) =>
        SESI_KELAS.map((sesi) => ({
          santriId: santri.id,
          sesi,
          status: cellStates[`${santri.id}-${sesi}`] || "KOSONG",
        })),
      );

      const res = await fetch("/api/absen-kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absensiId: parseInt(id as string), data }),
      });

      if (!res.ok) {
        alert("Gagal menyimpan absensi");
        return;
      }

      alert("Absensi berhasil disimpan!");
      router.push("/dashboard/absensi");
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Memuat data...</div>;

  const tanggal = absensi ? new Date(absensi.tanggal) : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Absen Kelas</h1>
        {tanggal && (
          <p className="text-gray-500 text-sm mt-1">
            {HARI[tanggal.getDay()]}, {tanggal.getDate()}{" "}
            {BULAN[tanggal.getMonth()]} {tanggal.getFullYear()}
          </p>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-gray-600 font-medium border-b border-r min-w-40">
                Nama Santri
              </th>
              {SESI_KELAS.map((sesi) => (
                <th
                  key={sesi}
                  className="px-4 py-3 text-center text-gray-600 font-medium border-b min-w-28"
                >
                  {sesi}
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
                      currentStatus={cellStates[`${santri.id}-${sesi}`] ?? null}
                      onChange={(status) =>
                        handleStatusChange(santri.id, sesi, status)
                      }
                      disabled={submitting}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tombol Submit */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting || santriList.length === 0}
          className="bg-[#1a6b3c] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#164d2f] transition disabled:opacity-50"
        >
          Submit Absensi
        </button>
      </div>

      {/* Dialog Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-2">Konfirmasi Submit</h2>
            <p className="text-gray-600 text-sm mb-6">
              Yakin ingin submit absensi hari ini?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-[#1a6b3c] text-white rounded-lg hover:bg-[#164d2f] disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Ya, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
