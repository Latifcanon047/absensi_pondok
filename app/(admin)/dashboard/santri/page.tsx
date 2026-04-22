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

  async function handleHapus(id: number) {
    if (!confirm("Yakin ingin menghapus santri ini?")) return;

    try {
      await fetch(`/api/santri/${id}`, { method: "DELETE" });
      fetchSantri();
    } catch {
      console.error("Gagal hapus santri");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Santri</h1>
        <button
          onClick={openTambah}
          className="bg-[#1a6b3c] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#164d2f] transition"
        >
          + Tambah Santri
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Memuat data...</div>
      ) : santriList.length === 0 ? (
        <div className="text-gray-500 text-sm">Belum ada santri</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">No</th>
                <th className="text-left px-4 py-3 text-gray-600">Nama</th>
                <th className="text-left px-4 py-3 text-gray-600">
                  Tanggal Ditambahkan
                </th>
                <th className="text-left px-4 py-3 text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {santriList.map((santri, index) => (
                <tr key={santri.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{santri.nama}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(santri.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(santri)}
                        className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleHapus(santri.id)}
                        className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">
              {editData ? "Edit Santri" : "Tambah Santri"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Santri
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
                  placeholder="Masukkan nama santri"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-[#1a6b3c] text-white rounded-lg hover:bg-[#164d2f] disabled:opacity-50"
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
