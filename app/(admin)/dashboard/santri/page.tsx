"use client";

import { useState, useEffect } from "react";

type Santri = {
  id: number;
  nama: string;
  createdAt: string;
};

export default function SantriPage() {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Santri | null>(null);
  const [nama, setNama] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const filteredList = santriList.filter((santri) =>
    santri.nama.toLowerCase().includes(search.toLowerCase()),
  );
  const [hapusId, setHapusId] = useState<number | null>(null);

  async function fetchSantri() {
    try {
      const res = await fetch("/api/santri");
      const data = await res.json();
      setSantriList(data);
    } catch {
      console.error("Gagal fetch santri");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSantri();
  }, []);

  function openTambah() {
    setEditData(null);
    setNama("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(santri: Santri) {
    setEditData(santri);
    setNama(santri.nama);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = editData ? `/api/santri/${editData.id}` : "/api/santri";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      setModalOpen(false);
      fetchSantri();
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setSubmitting(false);
    }
  }

  function handleHapus(id: number) {
    setHapusId(id);
  }

  async function konfirmasiHapus() {
    if (!hapusId) return;
    try {
      await fetch(`/api/santri/${hapusId}`, { method: "DELETE" });
      fetchSantri();
    } catch {
      console.error("Gagal hapus santri");
    } finally {
      setHapusId(null); // tutup modal
    }
  }

  return (
    <div>
      <div className="pt-5 sm:pt-15 md:pt-5 flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-gray-900">Data Santri</h1>
            <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
              {santriList.length} santri
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Kelola data santri aktif
          </p>
        </div>
        <button
          onClick={openTambah}
          className="bg-green-800 text-green-50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-900 transition flex items-center gap-1.5"
        >
          <span className="text-base leading-none">+</span> Tambah Santri
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Memuat data...</div>
      ) : santriList.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-12">
          Belum ada santri
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <svg
              className="w-3.5 h-3.5 text-gray-300"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M10 10l3 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="text-sm text-gray-700 placeholder:text-gray-300 bg-transparent outline-none w-full"
              placeholder="Cari nama santri..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-12">
                  No
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Nama
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-40">
                  Ditambahkan
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider w-28">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-gray-300"
                  >
                    Tidak ada santri dengan nama "{search}"
                  </td>
                </tr>
              ) : (
                filteredList.map((santri, index) => (
                  <tr
                    key={santri.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-green-100 text-green-800 text-[11px] font-medium flex items-center justify-center shrink-0">
                          {santri.nama
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-800">
                          {santri.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(santri.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(santri)}
                          className="text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleHapus(santri.id)}
                          className="text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal konfirmasi */}
      {hapusId && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setHapusId(null)}
        >
          <div
            className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-medium text-gray-800 mb-1">
              Hapus santri ini?
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Santri akan dihapus dari daftar dan tidak muncul di absensi.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setHapusId(null)}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={konfirmasiHapus}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-medium text-gray-800">
                {editData ? "Edit Santri" : "Tambah Santri"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-300 hover:text-gray-500 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Nama santri
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/10 focus:border-green-800"
                  placeholder="Masukkan nama santri"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-green-800 text-green-50 rounded-lg hover:bg-green-900 disabled:opacity-50 font-medium transition"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
