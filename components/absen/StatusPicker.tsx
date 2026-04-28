"use client";

import { useState, useRef, useEffect } from "react";
import { StatusAbsen } from "@prisma/client";
import StatusBadge from "./StatusBadge";

type Props = {
  currentStatus: StatusAbsen | null;
  onChange: (status: StatusAbsen) => void;
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
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOpen() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Kalau ruang bawah < 150px dan ruang atas lebih banyak → muncul ke atas
      setDropUp(spaceBelow < 150 && spaceAbove > spaceBelow);
    }
    setOpen(!open);
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className="disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StatusBadge status={currentStatus} />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-32 ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
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
