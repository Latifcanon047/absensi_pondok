"use client";

type FilterRekapProps = {
  dariTanggal: string;
  sampaiTanggal: string;
  loading: boolean;
  onDariTanggalChange: (val: string) => void;
  onSampaiTanggalChange: (val: string) => void;
  onLihatRekap: () => void;
};

export default function FilterRekap({
  dariTanggal,
  sampaiTanggal,
  loading,
  onDariTanggalChange,
  onSampaiTanggalChange,
  onLihatRekap,
}: FilterRekapProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-all duration-300">
      <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-700">Filter Periode</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => onDariTanggalChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => onSampaiTanggalChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>

        <button
          onClick={onLihatRekap}
          disabled={loading}
          className="group relative bg-linear-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memuat...
            </>
          ) : (
            <>Lihat Rekap</>
          )}
        </button>
      </div>
    </div>
  );
}
