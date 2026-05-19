interface SkeletonTableAbsensiProps {
  title: string;
  columns: string[];
  rows?: number;
}

export default function SkeletonTableAbsensi({
  title,
  columns,
  rows = 8,
}: SkeletonTableAbsensiProps) {
  return (
    <div className="bg-white rounded-lg my-5 border border-gray-200 overflow-hidden animate-pulse">
      {/* Header - lebih ramping */}
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="h-4 w-28 bg-gray-300 rounded"></div>
        <div className="h-2.5 w-16 bg-gray-200 rounded mt-1.5"></div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              {/* Nama Santri */}
              <th className="sticky left-0 bg-gray-100 z-10 px-3 py-2 text-left">
                <div className="h-3.5 w-20 bg-gray-300 rounded"></div>
              </th>

              {/* Columns */}
              {columns.map((_, idx) => (
                <th key={idx} className="px-3 py-2 text-center min-w-20">
                  <div className="h-3.5 w-12 mx-auto bg-gray-300 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100">
                {/* Nama */}
                <td
                  className={`sticky left-0 z-10 px-3 py-2 text-left ${
                    rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="h-3.5 w-32 bg-gray-200 rounded"></div>
                </td>

                {/* Status */}
                {columns.map((_, colIdx) => (
                  <td key={colIdx} className="px-3 py-2 text-center">
                    <div className="h-6 w-14 mx-auto rounded bg-gray-200"></div>
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
