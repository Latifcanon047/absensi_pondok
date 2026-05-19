"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

type ChartData = {
  tanggal: string;
  label?: string;
  hadir: number;
  izin: number;
  sakit: number;
  telat: number;
  alpa: number; // Data alpa ditambahkan
};

interface ChartDataAbsenProps {
  data: ChartData[];
}

const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function getLabel(item: ChartData): string {
  if (item.label) return item.label;
  const [y, m, d] = item.tanggal.split("-").map(Number);
  const date = new Date(y, m - 1, d); // ✅ local time
  return `${date.getDate()} ${HARI_SINGKAT[date.getDay()]}`;
}

function getFullDateLabel(item: ChartData): string {
  const [y, m, d] = item.tanggal.split("-").map(Number);
  const date = new Date(y, m - 1, d); // ✅ local time
  return `${date.getDate()} ${BULAN[date.getMonth()]} ${date.getFullYear()}`;
}

export default function ChartDataAbsen({ data }: ChartDataAbsenProps) {
  const processedData = data.map((item, idx) => {
    const label = getLabel(item);
    if (idx === 0) return { ...item, label, fullDate: getFullDateLabel(item) };

    const prev = data[idx - 1];
    return {
      ...item,
      label,
      fullDate: getFullDateLabel(item),
    };
  });

  const shouldAngle = processedData.length > 8;

  // Hitung total keseluruhan (termasuk alpa)
  const totals = processedData.reduce(
    (acc, curr) => ({
      hadir: acc.hadir + curr.hadir,
      izin: acc.izin + curr.izin,
      sakit: acc.sakit + curr.sakit,
      telat: acc.telat + curr.telat,
      alpa: acc.alpa + curr.alpa,
    }),
    { hadir: 0, izin: 0, sakit: 0, telat: 0, alpa: 0 },
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-lg p-4 min-w-45">
          <p className="text-xs font-medium text-gray-400 mb-2">
            {payload[0]?.payload.fullDate || label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4 pt-2">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-linear-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-6 transition-all duration-300 hover:shadow-xl">
      {/* Header with stats */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Tren Absensi Santri
            </h2>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Periode: {processedData[0]?.fullDate || "-"} -{" "}
              {processedData[processedData.length - 1]?.fullDate || "-"}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600">
              {processedData.length} Hari
            </span>
          </div>
        </div>

        {/* Stat Cards - ditambah card Alpa */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center justify-between mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">
                Hadir
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {totals.hadir}
            </p>
          </div>
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Izin</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{totals.izin}</p>
          </div>
          <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center justify-between mb-1">
              <XCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Sakit</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{totals.sakit}</p>
          </div>
          <div className="bg-red-50/50 rounded-xl p-3 border border-red-100">
            <div className="flex items-center justify-between mb-1">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600 font-medium">Telat</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{totals.telat}</p>
          </div>
          <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100">
            <div className="flex items-center justify-between mb-1">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span className="text-xs text-rose-600 font-medium">Alpa</span>
            </div>
            <p className="text-2xl font-bold text-rose-700">{totals.alpa}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={420}>
          <LineChart
            data={processedData}
            margin={{
              top: 10,
              right: 12,
              left: 0,
              bottom: shouldAngle ? 50 : 10,
            }}
          >
            <defs>
              <linearGradient id="gradientHadir" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientIzin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientSakit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientTelat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientAlpa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e5e7eb"
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{
                fontSize: 11,
                fill: "#6b7280",
                fontWeight: 500,
                angle: shouldAngle ? -40 : 0,
                textAnchor: shouldAngle ? "end" : "middle",
                dy: shouldAngle ? 4 : 0,
              }}
              interval={shouldAngle ? 1 : 0}
              height={shouldAngle ? 60 : 30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              width={35}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#d1d5db",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Legend content={<CustomLegend />} />
            <Line
              type="monotone"
              dataKey="izin"
              stroke="#3b82f6"
              name="Izin"
              strokeWidth={2.5}
              dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "#3b82f6",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              strokeLinecap="round"
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="sakit"
              stroke="#8b5cf6"
              name="Sakit"
              strokeWidth={2.5}
              dot={{ fill: "#8b5cf6", r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "#8b5cf6",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              strokeLinecap="round"
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="telat"
              stroke="#ef4444"
              name="Telat"
              strokeWidth={2.5}
              dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "#ef4444",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              strokeLinecap="round"
              animationDuration={1000}
              animationEasing="ease-out"
            />
            {/* Line baru untuk Alpa dengan warna merah (rose) */}
            <Line
              type="monotone"
              dataKey="alpa"
              stroke="#e11d48"
              name="Alpa"
              strokeWidth={2.5}
              dot={{ fill: "#e11d48", r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "#e11d48",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              strokeLinecap="round"
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400">
          Grafik menampilkan tren absensi per hari
        </p>
      </div>
    </div>
  );
}
