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
      bg: `${
        summaryChart.skor >= 95
          ? "from-emerald-50 to-emerald-100/50"
          : summaryChart.skor >= 90
            ? "from-blue-50 to-blue-100/50"
            : summaryChart.skor >= 85
              ? "from-orange-50 to-orange-100/50"
              : summaryChart.skor >= 75
                ? "from-red-50 to-red-100/50"
                : "from-red-100 to-red-200/50"
      }`,
      text: `${
        summaryChart.skor >= 95
          ? "text-emerald-700"
          : summaryChart.skor >= 90
            ? "text-blue-700"
            : summaryChart.skor >= 85
              ? "text-orange-700"
              : summaryChart.skor >= 75
                ? "text-red-700"
                : "text-red-800"
      }`,
      labelColor: `${
        summaryChart.skor >= 95
          ? "text-emerald-600"
          : summaryChart.skor >= 90
            ? "text-blue-600"
            : summaryChart.skor >= 85
              ? "text-orange-600"
              : summaryChart.skor >= 75
                ? "text-red-600"
                : "text-red-700"
      }`,
    },
  ];

  //                       className={`
  //   px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap
  //   ${
  //     santri.skorFinal >= 95
  //       ? "bg-green-100 text-green-700"
  //       : santri.skorFinal >= 90
  //         ? "bg-blue-100 text-blue-600"
  //         : santri.skorFinal >= 85
  //           ? "bg-orange-100 text-orange-600"
  //           : santri.skorFinal >= 75
  //             ? "bg-red-100 text-red-700"
  //             : "bg-red-200 text-red-800"
  //   }
  // `}

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
