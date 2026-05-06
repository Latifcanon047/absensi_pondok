export function formatTanggal(date: Date): string {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
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
  return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`; // Contoh: "Senin, 5 September 2024"
}

export function hitungSkor(hadir: number, telat: number, alpa: number): number {
  const total = hadir + telat + alpa;
  if (total === 0) return 0;
  const skor = ((hadir * 1 + alpa * -0.75) / total) * 100;
  return Math.round(skor * 10) / 10; //untuk membulatkan skor ke 1 desimal, misal 85.6666 => 85.7
}
