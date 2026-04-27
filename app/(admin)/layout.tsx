"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-[#1a6b3c] text-white fixed h-full">
        <div className="p-6 border-b border-green-700">
          <h1 className="text-xl font-bold">Absensi Pesantren</h1>
          <p className="text-green-300 text-xs mt-1">Panel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
          >
            🏠 Dashboard
          </Link>
          <Link
            href="/dashboard/absensi"
            className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
          >
            📋 List Absensi
          </Link>
          <Link
            href="/dashboard/absensi/buat"
            className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
          >
            ✏️ Buat Absensi
          </Link>
          <Link
            href="/dashboard/santri"
            className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
          >
            👤 Data Santri
          </Link>
          <Link
            href="/rekap"
            className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
          >
            Rekap Absensi
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
          >
            ⚙️ Pengaturan
          </Link>
        </nav>

        <div className="p-4 border-t border-green-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-300 hover:text-red-200 text-sm transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#1a6b3c] text-white z-30 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold">Absensi Pesantren</h1>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="absolute top-0 left-0 h-full w-64 bg-[#1a6b3c] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-green-700 mt-14">
              <p className="text-green-300 text-xs">Panel Admin</p>
            </div>
            <nav className="p-4 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
              >
                🏠 Dashboard
              </Link>
              <Link
                href="/dashboard/absensi"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
              >
                📋 List Absensi
              </Link>
              <Link
                href="/dashboard/absensi/buat"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
              >
                ✏️ Buat Absensi
              </Link>
              <Link
                href="/dashboard/santri"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
              >
                👤 Data Santri
              </Link>
              <Link
                href="/rekap"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
              >
                Rekap Absensi
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-[#164d2f] transition text-sm"
              >
                ⚙️ Pengaturan
              </Link>
            </nav>
            <div className="p-4 border-t border-green-700">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-300 text-sm"
              >
                🚪 Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 p-6">{children}</main>
    </div>
  );
}
