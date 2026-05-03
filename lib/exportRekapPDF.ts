type RekapItem = {
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
};

type RekapSantri = {
  id: number;
  nama: string;
  isArchived: boolean;
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
  sholat: RekapItem;
  kelas: RekapItem;
  makan: RekapItem;
  asrama: RekapItem;
  gabungan: RekapItem;
};

type Summary = {
  hadir: number;
  telat: number;
  sakit: number;
  izin: number;
  alpa: number;
  skor: number;
};

type ExportOptions = {
  judul?: string;
  judulRingkasan?: string;
  sections?: {
    title: string;
    key: keyof RekapSantri;
  }[];
};

function formatTanggalIndonesia(dateString: string) {
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const [year, month, day] = dateString.split("-");
  return `${parseInt(day)} ${bulan[parseInt(month) - 1]} ${year}`;
}

export async function exportRekapPDF(
  dariTanggal: string,
  sampaiTanggal: string,
  santri: RekapSantri[],
  summaryChart: Summary | null,
  options: ExportOptions = {},
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const {
    judul = "LAPORAN REKAP ABSEN",
    judulRingkasan = "RINGKASAN KEDISIPLINAN KESELURUHAN",
    sections = [
      { title: "Absen Sholat", key: "sholat" },
      { title: "Absen Kelas", key: "kelas" },
      { title: "Rekap Keseluruhan", key: "gabungan" },
    ],
  } = options;

  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [26, 107, 60];
  const marginLeft = 14;
  const marginRight = 196;
  const pageWidth = 210;
  const contentWidth = pageWidth - marginLeft * 2;

  // ===== HEADER =====
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 5, "F");

  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(judul, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Periode: ${formatTanggalIndonesia(dariTanggal)} s/d ${formatTanggalIndonesia(sampaiTanggal)}`,
    pageWidth / 2,
    28,
    { align: "center" },
  );

  doc.setDrawColor(220, 220, 220);
  doc.line(marginLeft, 34, marginRight, 34);

  // ===== HELPER TABLE =====
  const renderTable = (title: string, data: any[], startY: number) => {
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(title, marginLeft, startY);

    doc.setDrawColor(230, 230, 230);
    doc.line(marginLeft, startY + 2, marginRight, startY + 2);

    autoTable(doc, {
      startY: startY + 6,
      head: [["No", "Nama", "Hadir", "Telat", "Sakit", "Izin", "Alpa", "Skor"]],
      body: data.map((s, i) => [
        i + 1,
        s.nama,
        s.hadir,
        s.telat,
        s.sakit,
        s.izin,
        s.alpa,
        `${s.skor}%`,
      ]),
      styles: { fontSize: 8, halign: "center" },
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
      },
      columnStyles: { 1: { halign: "left" } },
      alternateRowStyles: { fillColor: [240, 250, 244] },
      margin: { left: marginLeft, right: marginLeft },
      tableWidth: contentWidth,
    });

    return (doc as any).lastAutoTable.finalY + 12;
  };

  // ===== RENDER SECTIONS =====
  let currentY = 40;
  for (const section of sections) {
    const sectionData = santri.map((s) => {
      const item = s[section.key] as RekapItem;
      return { nama: s.nama, ...item };
    });
    currentY = renderTable(section.title, sectionData, currentY);
  }

  // ===== SUMMARY CARDS =====
  let finalY = currentY + 5;

  if (summaryChart) {
    if (finalY > 240) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(judulRingkasan, pageWidth / 2, finalY, { align: "center" });

    finalY += 10;

    const statsData = [
      {
        label: "Hadir",
        value: summaryChart.hadir,
        bg: [240, 253, 244],
        color: [22, 163, 74],
      },
      {
        label: "Telat",
        value: summaryChart.telat,
        bg: [255, 247, 237],
        color: [234, 88, 12],
      },
      {
        label: "Sakit",
        value: summaryChart.sakit,
        bg: [255, 251, 235],
        color: [217, 119, 6],
      },
      {
        label: "Izin",
        value: summaryChart.izin,
        bg: [239, 246, 255],
        color: [37, 99, 235],
      },
      {
        label: "Alpa",
        value: summaryChart.alpa,
        bg: [254, 242, 242],
        color: [220, 38, 38],
      },
      {
        label: "Skor",
        value: `${summaryChart.skor}%`,
        bg: [240, 250, 244],
        color: primaryColor,
      },
    ];

    const cardW = contentWidth / 6 - 3;

    statsData.forEach((stat, i) => {
      const xPos = marginLeft + i * (cardW + 3.6);
      const yPos = finalY + 6;

      doc.setFillColor(stat.bg[0], stat.bg[1], stat.bg[2]);
      doc.roundedRect(xPos, yPos, cardW, 28, 3, 3, "F");
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(xPos, yPos, cardW, 28, 3, 3, "S");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(stat.label, xPos + cardW / 2, yPos + 9, { align: "center" });
      doc.setFontSize(13);
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(String(stat.value), xPos + cardW / 2, yPos + 22, {
        align: "center",
      });
    });
  }

  // ===== FOOTER =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(marginLeft, 280, marginRight, 280);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const now = new Date();
    const date = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
    doc.text(`Dicetak: ${date}`, marginLeft, 288);
    doc.text(`Hal. ${i}/${pageCount}`, marginRight, 288, { align: "right" });
    doc.text("Pondok Pesantren", pageWidth / 2, 288, { align: "center" });
  }

  doc.save(`Rekap_${dariTanggal}_sd_${sampaiTanggal}.pdf`);
}
