// SkeletonRekap.tsx
import React from "react";

interface SkeletonRekapProps {
  showCards?: boolean;
  cardCount?: number;
  rowCount?: number;
}

const SkeletonRekap: React.FC<SkeletonRekapProps> = ({
  showCards = true,
  cardCount = 3,
  rowCount = 5,
}) => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="h-7 w-72 bg-linear-to-r from-gray-200 to-gray-100 rounded-lg"></div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      {showCards && (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: cardCount }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="px-6 py-3 border-b border-gray-50">
                <div className="h-5 w-32 bg-linear-to-r from-gray-200 to-gray-100 rounded"></div>
              </div>
              <div className="p-6 space-y-2">
                {Array.from({ length: rowCount }).map((_, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="flex items-center justify-between"
                  >
                    <div className="h-4 w-8 bg-gray-200 rounded"></div>
                    <div className="h-4 w-60 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-25 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Section Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-linear-to-r from-gray-200 to-gray-100 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full h-87.5 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Memuat grafik...</p>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="h-6 w-64 bg-linear-to-r from-gray-200 to-gray-100 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Button Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="h-10 w-32 bg-linear-to-r from-gray-200 to-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonRekap;
