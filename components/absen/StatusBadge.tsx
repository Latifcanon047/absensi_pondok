"use client";

import { StatusAbsen } from "@prisma/client";

type Props = {
  status: StatusAbsen | null;
};

export default function StatusBadge({ status }: Props) {
  if (!status) {
    return (
      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-400">
        -
      </span>
    );
  }

  const config = {
    HADIR: { bg: "bg-green-100", text: "text-green-700", label: "✅ Hadir" },
    TELAT: { bg: "bg-orange-100", text: "text-orange-700", label: "🕐 Telat" },
    SAKIT: { bg: "bg-yellow-100", text: "text-yellow-700", label: "S Sakit" },
    IZIN: { bg: "bg-blue-100", text: "text-blue-700", label: "I Izin" },
    ALPA: { bg: "bg-red-100", text: "text-red-700", label: "A Alpa" },
    KOSONG: { bg: "bg-gray-100", text: "text-gray-400", label: "-" },
  };

  const { bg, text, label } = config[status]; //kalo statusnya HADIR, maka bg = "bg-green-100", text = "text-green-700", label = "✅ Hadir"

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}
