"use client";

import { StatusAbsen } from "@prisma/client";
import StatusBadgePiket from "./StatusBadgePiket";

type Santri = {
  id: number;
  nama: string;
};

type TabelMakanReadOnlyProps = {
  santriList: Santri[];
  sesiMakan: string[];
  makanStates: Record<string, StatusAbsen | null>;
};

export default function TabelMakanReadOnly({
  santriList,
  sesiMakan,
  makanStates,
}: TabelMakanReadOnlyProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
        <div>
          <h2 className="font-semibold text-gray-800">Absen Makan</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {santriList.length} santri
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Santri
              </th>
              {sesiMakan.map((sesi) => (
                <th
                  key={sesi}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24"
                >
                  {sesi}
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
                {sesiMakan.map((sesi) => (
                  <td key={sesi} className="px-4 py-3 text-center">
                    <StatusBadgePiket
                      status={makanStates[`${santri.id}-${sesi}`] ?? null}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
