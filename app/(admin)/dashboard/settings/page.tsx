"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSukses(false);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordLama, passwordBaru, konfirmasi }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      setSukses(true);
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasi("");
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
        <h2 className="font-semibold text-gray-700 mb-4">Ganti Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Lama
            </label>
            <input
              type="password"
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
              placeholder="Masukkan password lama"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
              placeholder="Ulangi password baru"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {sukses && (
            <p className="text-green-600 text-sm">
              ✅ Password berhasil diganti!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6b3c] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#164d2f] transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Ganti Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
