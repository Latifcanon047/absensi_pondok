"use client";

import { useState, useRef, useEffect } from "react";
import { StatusAbsen } from "@prisma/client";
import StatusBadgePiket from "./StatusBadgePiket";

type Props = {
  currentStatus: StatusAbsen | null;
  onChange: (status: StatusAbsen) => void;
  disabled?: boolean;
};

const OPTIONS: {
  value: StatusAbsen;
  label: string;
  bg: string;
  text: string;
}[] = [
  {
    value: "HADIR",
    label: "Piket",
    bg: "hover:bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    value: "TELAT",
    label: "Telat",
    bg: "hover:bg-orange-50",
    text: "text-orange-700",
  },
  {
    value: "SAKIT",
    label: "Sakit",
    bg: "hover:bg-yellow-50",
    text: "text-yellow-700",
  },
  {
    value: "IZIN",
    label: "Izin",
    bg: "hover:bg-blue-50",
    text: "text-blue-700",
  },
  { value: "ALPA", label: "Alpa", bg: "hover:bg-red-50", text: "text-red-700" },
  {
    value: "KOSONG",
    label: "-",
    bg: "hover:bg-gray-50",
    text: "text-gray-400",
  },
];

export default function StatusPicker({
  currentStatus,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StatusBadgePiket status={currentStatus} />
      </button>

      {open && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1 min-w-32">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${opt.bg} ${opt.text}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
