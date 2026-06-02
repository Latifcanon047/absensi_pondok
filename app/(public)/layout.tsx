"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Kedisiplinan", href: "/rekap-absen" },
    { name: "Tanggung Jawab", href: "/rekap-piket" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Data Absen", href: "/data-absen" },
  ];

  async function handleNavigate() {
    try {
      // 1. Tembak API internal Next.js yang kita buat tadi
      const res = await fetch("/api/check-session", { cache: "no-store" });
      const data = await res.json();

      // 2. Jika API bilang 'false' (cookie tidak ada)
      if (!data.authenticated) {
        confirm("Anda belum login. Apakah ingin masuk ke halaman login?") &&
          router.push("/login");
        return; // Stop di sini
      }

      // 3. Jika API bilang 'true' (cookie aman ada di server)
      router.push("/dashboard/absensi");
    } catch (error) {
      console.error("Gagal memeriksa sesi:", error);
      alert("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link
              href="/"
              className="font-bold text-base sm:text-xl text-emerald-700"
            >
              Absensi Pesantren
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:text-emerald-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleNavigate}
                className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition text-gray-600 hover:text-emerald-700 hover:bg-gray-50
                
                    `}
              >
                Absensi
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - muncul dari samping kiri */}
      <div
        className={`
          fixed inset-0 z-50 transition-all duration-300 md:hidden
          ${isMenuOpen ? "visible" : "invisible"}
        `}
      >
        {/* Overlay */}
        <div
          className={`
            absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300
            ${isMenuOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sidebar Navigation */}
        <aside
          className={`
            absolute top-0 left-0 h-full w-64 bg-white shadow-xl
            transition-transform duration-300 ease-out
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Header Sidebar */}
            <div className="p-4 border-b border-gray-100">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-bold text-xl text-emerald-700 block"
              >
                Absensi Pesantren
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-4">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      block px-4 py-3 mx-2 rounded-lg text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-600 hover:text-emerald-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleNavigate}
                className={`
                      block px-4 py-3 mx-2 rounded-lg text-sm font-medium transition text-gray-600 hover:text-emerald-700 hover:bg-gray-50
                    `}
              >
                Absensi
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
