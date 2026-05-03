"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Summary = {
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
};

type GrafikAbsensiProps = {
  summaryChart: Summary;
};

export default function GrafikAbsensi({ summaryChart }: GrafikAbsensiProps) {
  const data = [
    { name: "Hadir", jumlah: summaryChart.hadir, fill: "#16a34a" },
    { name: "Telat", jumlah: summaryChart.telat, fill: "#ea580c" },
    { name: "Sakit", jumlah: summaryChart.sakit, fill: "#d97706" },
    { name: "Izin", jumlah: summaryChart.izin, fill: "#2563eb" },
    { name: "Alpa", jumlah: summaryChart.alpa, fill: "#dc2626" },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -35, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            backgroundColor: "white",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            padding: "8px 12px",
          }}
        />
        <Bar dataKey="jumlah" name="Jumlah" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <rect key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
