"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Stats = {
  totalSantri: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setStats(data);
      } catch {
        console.error("Gagal fetch stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">
        Selamat datang di panel admin
      </p>

      {/* Statistik */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Total Santri Aktif</p>
          <p className="text-3xl font-bold text-[#1a6b3c]">
            {loading ? "..." : stats?.totalSantri || 0}
          </p>
        </div>{" "}
      </div>

      {/* Link Cepat */}
      <h2 className="font-semibold text-gray-700 mb-4">Akses Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Link
          href="/dashboard/absensi/buat"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-transparent hover:border-[#1a6b3c]"
        >
          <p className="text-2xl mb-2">✏️</p>
          <p className="font-semibold text-gray-800">Buat Absensi</p>
          <p className="text-sm text-gray-500 mt-1">
            Buat absensi sholat atau kelas baru
          </p>
        </Link>
        <Link
          href="/dashboard/absensi"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-transparent hover:border-[#1a6b3c]"
        >
          <p className="text-2xl mb-2">📋</p>
          <p className="font-semibold text-gray-800">List Absensi</p>
          <p className="text-sm text-gray-500 mt-1">
            Lihat dan isi absensi yang sudah dibuat
          </p>
        </Link>
        <Link
          href="/dashboard/santri"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-transparent hover:border-[#1a6b3c]"
        >
          <p className="text-2xl mb-2">👤</p>
          <p className="font-semibold text-gray-800">Data Santri</p>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data santri pesantren
          </p>
        </Link>
        <Link
          href="/rekap"
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-transparent hover:border-[#1a6b3c]"
        >
          <p className="text-2xl mb-2">📊</p>
          <p className="font-semibold text-gray-800">Lihat Rekap</p>
          <p className="text-sm text-gray-500 mt-1">
            Rekap absensi semua santri
          </p>
        </Link>
      </div>
    </div>
  );
}
