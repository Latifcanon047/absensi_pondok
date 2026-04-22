export function getMingguRange(mingguKe: number, bulan: number, tahun: number) {
  // Cari tanggal 1 bulan tersebut
  const tanggal1 = new Date(tahun, bulan - 1, 1);

  // Cari Senin pertama di bulan tersebut
  const hariPertama = tanggal1.getDay(); // 0=Minggu, 1=Senin, dst
  const selisihKeSenin =
    hariPertama === 0 ? 1 : hariPertama === 1 ? 0 : 8 - hariPertama;
  const seninPertama = new Date(tahun, bulan - 1, 1 + selisihKeSenin);

  // Hitung tanggal mulai minggu ke-N
  const tanggalMulai = new Date(seninPertama);
  tanggalMulai.setDate(seninPertama.getDate() + (mingguKe - 1) * 7);

  // Tanggal selesai = tanggal mulai + 6 hari (Minggu)
  const tanggalSelesai = new Date(tanggalMulai);
  tanggalSelesai.setDate(tanggalMulai.getDate() + 6);

  return { tanggalMulai, tanggalSelesai };// Contoh: getMingguRange(2, 9, 2024) => { tanggalMulai: 2024-09-09, tanggalSelesai: 2024-09-15 }
}

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
  return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;// Contoh: "Senin, 5 September 2024"
}

export function hitungSkor(hadir: number, telat: number, alpa: number): number {
  const total = hadir + telat + alpa;
  if (total === 0) return 0;
  const skor = ((hadir * 1 + telat * 0.5) / total) * 100;
  return Math.round(skor * 10) / 10;//untuk membulatkan skor ke 1 desimal, misal 85.6666 => 85.7
}
