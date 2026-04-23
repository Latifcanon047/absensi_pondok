-- AlterTable
ALTER TABLE `AbsenKelas` MODIFY `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TELAT', 'KOSONG') NOT NULL;

-- AlterTable
ALTER TABLE `AbsenSholat` MODIFY `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TELAT', 'KOSONG') NOT NULL;
