// SkeletonLeaderboard.tsx
import React from "react";

interface SkeletonLeaderboardProps {
  cardCount?: number;
}

const SkeletonLeaderboard: React.FC<SkeletonLeaderboardProps> = ({
  cardCount = 6,
}) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cardCount }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden"
          >
            {/* Medal/Rank Skeleton */}
            <div className="absolute -top-3 -left-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 shadow-md"></div>
            </div>

            {/* Header: Avatar and Name */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-5 w-28 bg-gray-200 rounded mb-1"></div>
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            </div>

            {/* Detail Skor */}
            <div className="space-y-3">
              {/* Kedisiplinan Skeleton */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  <div className="h-3 w-10 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gray-200 h-2 rounded-full w-3/4"></div>
                </div>
              </div>

              {/* Tanggung Jawab Skeleton */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  <div className="h-3 w-10 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gray-200 h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Skor Final Skeleton */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gray-200 h-1.5 rounded-full w-2/3"></div>
                </div>
                <div className="h-5 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLeaderboard;
