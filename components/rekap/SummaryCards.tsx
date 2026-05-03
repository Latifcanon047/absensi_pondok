type Summary = {
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
};

type SummaryCardsProps = {
  summaryChart: Summary;
  labels?: {
    hadir?: string;
    telat?: string;
    sakit?: string;
    izin?: string;
    alpa?: string;
    skor?: string;
  };
};

export default function SummaryCards({
  summaryChart,
  labels = {},
}: SummaryCardsProps) {
  const stats = [
    {
      label: labels.hadir ?? "Hadir",
      value: summaryChart.hadir,
      bg: "from-green-50 to-green-100/50",
      text: "text-green-700",
      labelColor: "text-green-600",
    },
    {
      label: labels.telat ?? "Telat",
      value: summaryChart.telat,
      bg: "from-orange-50 to-orange-100/50",
      text: "text-orange-700",
      labelColor: "text-orange-600",
    },
    {
      label: labels.sakit ?? "Sakit",
      value: summaryChart.sakit,
      bg: "from-amber-50 to-amber-100/50",
      text: "text-amber-700",
      labelColor: "text-amber-600",
    },
    {
      label: labels.izin ?? "Izin",
      value: summaryChart.izin,
      bg: "from-blue-50 to-blue-100/50",
      text: "text-blue-700",
      labelColor: "text-blue-600",
    },
    {
      label: labels.alpa ?? "Alpa",
      value: summaryChart.alpa,
      bg: "from-red-50 to-red-100/50",
      text: "text-red-700",
      labelColor: "text-red-600",
    },
    {
      label: labels.skor ?? "Skor",
      value: `${summaryChart.skor}%`,
      bg: "from-emerald-50 to-emerald-100/50",
      text: "text-emerald-700",
      labelColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-linear-to-br ${stat.bg} rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200`}
        >
          <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
          <p className={`text-xs mt-1 font-medium ${stat.labelColor}`}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
