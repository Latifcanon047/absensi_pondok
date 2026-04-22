"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // useEffect hanya jalan di client setelah render pertama
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Jika belum 'mounted', jangan tampilkan form dulu (atau tampilkan loading)
  if (!isMounted) {
    return null; // atau spinner
  }

  async function handleSubmit(e: React.FormEvent) {
    //e: react.FormEvent untuk memberi tahu TypeScript bahwa event yang kita tangani adalah event submit dari form. supaya TypeScript bisa memberikan tipe data yang tepat untuk event tersebut
    e.preventDefault(); //preventDefault() untuk mencegah perilaku default dari form yang akan me-refresh halaman saat disubmit
    setError(""); //setError("") untuk menghapus pesan error yang mungkin muncul dari percobaan login sebelumnya
    setLoading(true); //loading(true) untuk menandakan bahwa proses login sedang berlangsung, sehingga kita bisa menampilkan indikator loading di UI dan mencegah pengguna melakukan submit berulang kali sebelum proses selesai

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, //headers untuk memberi tahu server bahwa kita mengirim data dalam format JSON
        body: JSON.stringify({ username, password }), //body untuk mengirim data username dan password yang diinputkan oleh pengguna ke server dalam format JSON
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      if (data.success) {
        setSuccess("Login berhasil!");
      }

      router.push("/dashboard");
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1a6b3c] mb-2">Login Admin</h1>
        <p className="text-gray-500 text-sm mb-6">
          Masuk untuk mengelola absensi pesantren
        </p>

        <form
          onSubmit={handleSubmit}
          suppressHydrationWarning
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
              placeholder="Masukkan password"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a6b3c] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#164d2f] transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
