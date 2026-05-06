"use client";

type RekapItem = {
  hadir: number;
  telat: number;
  alpa: number;
  izin: number;
  sakit: number;
  skor: number;
};

type RekapSantri = {
  id: number;
  nama: string;
  isArchived: boolean;
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
  sholat: RekapItem;
  kelas: RekapItem;
  makan: RekapItem;
  asrama: RekapItem;
  gabungan: RekapItem;
};

export default function RekapTable({
  data,
  judul,
}: {
  data: RekapSantri[];
  judul: string;
}) {
  const key =
    judul === "Absen Sholat"
      ? "sholat"
      : judul === "Absen Kelas"
        ? "kelas"
        : judul === "Piket Makan"
          ? "makan"
          : judul === "Piket Asrama"
            ? "asrama"
            : "gabungan";
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 my-6">
      {/* Header dengan linear dan icon */}
      <div className="relative px-6 py-4 bg-linear-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800">{judul}</h2>
          </div>
        </div>
      </div>

      {/* Table dengan desain modern */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                No
              </th>
              <th className="sticky left-0 shadow-[6px_0_8px_rgba(0,0,0,0.15)] bg-gray-50 text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Santri
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-emerald-600 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Hadir
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-orange-600 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Telat
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-blue-600 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Sakit
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-amber-600 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Izin
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-red-600 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Alpa
                </div>
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  Skor
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((santri, index) => {
              const statusData = santri[key] || santri;
              return (
                <tr
                  key={santri.id}
                  className="hover:bg-gray-50/50 transition-colors duration-200 group-hover:bg-transparent"
                >
                  {/* Nomor Urut */}
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </td>

                  {/* Nama santri */}
                  <td className="sticky left-0 shadow-[6px_0_8px_rgba(0,0,0,0.15)] px-4 py-3 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        {santri.nama}
                      </span>
                      {santri.isArchived && (
                        <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          nonaktif
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Badge untuk setiap status */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-semibold text-sm">
                      {statusData?.hadir || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-orange-50 text-orange-600 font-semibold text-sm">
                      {statusData?.telat || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm">
                      {statusData?.sakit || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 font-semibold text-sm">
                      {statusData?.izin || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-red-50 text-red-600 font-semibold text-sm">
                      {statusData?.alpa || 0}
                    </span>
                  </td>

                  {/* Skor dengan progress bar indicator */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`font-bold text-sm ${
                          (statusData?.skor || 0) >= 97
                            ? "text-emerald-600"
                            : (statusData?.skor || 0) >= 95
                              ? "text-blue-600"
                              : (statusData?.skor || 0) >= 90
                                ? "text-orange-500"
                                : (statusData?.skor || 0) >= 85
                                  ? "text-red-500"
                                  : "text-red-700"
                        }`}
                      >
                        {statusData?.skor || 0}%
                      </span>
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (statusData?.skor || 0) >= 97
                              ? "bg-emerald-600"
                              : (statusData?.skor || 0) >= 95
                                ? "bg-blue-800"
                                : (statusData?.skor || 0) >= 90
                                  ? "bg-orange-500"
                                  : (statusData?.skor || 0) >= 85
                                    ? "bg-red-500"
                                    : "bg-red-700"
                          }`}
                          style={{ width: `${statusData?.skor || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer dengan informasi tambahan (opsional) */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-400 text-sm">
            Tidak ada data dalam periode ini
          </p>
        </div>
      )}
    </div>
  );
}
