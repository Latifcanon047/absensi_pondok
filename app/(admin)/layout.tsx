"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "List Absensi", href: "/dashboard/absensi", icon: "📋" },
    { name: "Buat Absensi", href: "/dashboard/absensi/buat", icon: "✏️" },
    { name: "Data Santri", href: "/dashboard/santri", icon: "👤" },
    { name: "Rekap Absensi", href: "/rekap", icon: "📊" },
    { name: "Pengaturan", href: "/dashboard/settings", icon: "⚙️" },
  ];

  const isActive = (href: string) => {
    // Untuk Dashboard: hanya aktif jika persis sama
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    // Untuk List Absensi: aktif hanya jika pathname persis sama atau berada di dalam route list absensi
    // TAPI tidak boleh aktif jika di buat absensi
    if (href === "/dashboard/absensi") {
      // Aktif jika di /dashboard/absensi atau child routes SELAIN /dashboard/absensi/buat
      if (pathname === "/dashboard/absensi") {
        return true;
      }
      // Cek apakah di dalam route absensi tapi bukan buat absensi
      if (
        pathname.startsWith("/dashboard/absensi/") &&
        pathname !== "/dashboard/absensi/buat"
      ) {
        return true;
      }
      return false;
    }

    // Untuk Buat Absensi: aktif hanya jika pathname persis
    if (href === "/dashboard/absensi/buat") {
      return pathname === "/dashboard/absensi/buat";
    }

    // Untuk menu lain: aktif jika pathname sama persis atau child yang tepat
    if (pathname === href) {
      return true;
    }

    // Cek apakah ini adalah parent dari pathname saat ini (untuk nested routes)
    if (pathname.startsWith(href + "/")) {
      return true;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-linear-to-b from-emerald-800 to-emerald-900 text-white fixed h-full shadow-xl z-30">
        {/* Logo Area */}
        <div className="p-6 border-b border-emerald-700/50">
          <h1 className="text-xl font-bold tracking-tight">
            Absensi Pesantren
          </h1>
          <p className="text-emerald-300 text-xs mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Panel Administrator
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-emerald-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:text-red-200 hover:bg-white/10 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-lg z-40 px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <div>
          <h1 className="font-bold text-emerald-700">Absensi Pesantren</h1>
          <p className="text-xs text-gray-400">Panel Admin</p>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition-all duration-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
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

      {/* Mobile Sidebar - muncul dari samping kiri */}
      <div
        className={`
          fixed inset-0 z-40 transition-all duration-300 md:hidden
          ${menuOpen ? "visible" : "invisible"}
        `}
      >
        {/* Overlay */}
        <div
          className={`
            absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300
            ${menuOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setMenuOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`
            absolute top-0 left-0 h-full w-72 bg-linear-to-b from-emerald-800 to-emerald-900 text-white shadow-2xl
            transition-transform duration-300 ease-out
            ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Logo Area Mobile */}
          <div className="p-6 border-b border-emerald-700/50 pt-16">
            <h1 className="text-xl font-bold tracking-tight">
              Absensi Pesantren
            </h1>
            <p className="text-emerald-300 text-xs mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Panel Administrator
            </p>
          </div>

          {/* Navigation Mobile */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button Mobile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700/50 bg-linear-to-t from-emerald-900/50 to-transparent">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:text-red-200 hover:bg-white/10 transition-all duration-200"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 min-h-screen">
        <div className="pt-14 md:pt-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
