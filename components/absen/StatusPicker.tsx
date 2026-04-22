"use client";

import { useState, useRef, useEffect } from "react";
import { StatusAbsen } from "@prisma/client";
import StatusBadge from "./StatusBadge";

type Props = {
  currentStatus: StatusAbsen | null;
  onChange: (status: StatusAbsen) => void;//void itu artinya fungsi ini gak ngembaliin apa-apa, cuma ngejalanin sesuatu aja. Jadi kalo kita panggil onChange("HADIR"), maka dia bakal ngejalanin fungsi yang kita kasih dari parent component, tapi gak ngembaliin nilai apapun ke tempat kita manggil onChange itu
  disabled?: boolean;
};

const OPTIONS: { value: StatusAbsen; label: string }[] = [
  { value: "HADIR", label: "✅ Hadir" },
  { value: "TELAT", label: "🕐 Telat" },
  { value: "SAKIT", label: "S Sakit" },
  { value: "IZIN", label: "I Izin" },
  { value: "ALPA", label: "A Alpa" },
];

export default function StatusPicker({
  currentStatus,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);//ref ini buat ngeakses elemen div yang kita render nanti, supaya kita bisa ngecek apakah user klik di luar elemen itu atau enggak

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
        <StatusBadge status={currentStatus} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-32">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-gray-50 transition"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
