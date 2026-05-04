"use client";

import { StatusAbsen } from "@prisma/client";
import StatusPicker from "./StatusPicker";

type Santri = {
  id: number;
  nama: string;
};

type TabelKelasProps = {
  santriList: Santri[];
  sesiKelas: string[];
  kelasStates: Record<string, StatusAbsen | null>;
  submitting: string | null;
  sukses: boolean;
  onTandaiSemua: (checked: boolean) => void;
  onStatusChange: (santriId: number, sesi: string, status: StatusAbsen) => void;
  onSubmit: () => void;
};

export default function TabelKelas({
  santriList,
  sesiKelas,
  kelasStates,
  submitting,
  sukses,
  onTandaiSemua,
  onStatusChange,
  onSubmit,
}: TabelKelasProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="px-6 py-4 border-b border-gray-100 bg-linear-210-to-r from-gray-50 to-white flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-800">Absen Kelas</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {santriList.length} santri
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              onChange={(e) => onTandaiSemua(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
            <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
              Tandai Semua Hadir
            </span>
          </label>
          {sukses && (
            <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1 rounded-full">
              Tersimpan
            </span>
          )}
          <button
            onClick={onSubmit}
            disabled={submitting !== null}
            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors duration-200"
          >
            {submitting === "KELAS" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Menyimpan
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Santri
              </th>
              {sesiKelas.map((s) => (
                <th
                  key={s}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24"
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {santriList.map((santri, index) => (
              <tr
                key={santri.id}
                className="hover:bg-gray-50/50 transition-colors duration-150"
              >
                <td
                  className={`sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] px-5 py-3 font-medium text-gray-700 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  {santri.nama}
                </td>
                {sesiKelas.map((sesi) => (
                  <td key={sesi} className="px-4 py-3 text-center">
                    <StatusPicker
                      currentStatus={
                        kelasStates[`${santri.id}-${sesi}`] ?? null
                      }
                      onChange={(s) => onStatusChange(santri.id, sesi, s)}
                      disabled={submitting !== null}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="h-37" />
      </div>
    </div>
  );
}
