/*
  Warnings:

  - A unique constraint covering the columns `[absensiId,santriId,hari,sesi]` on the table `AbsenKelas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[absensiId,santriId,hari,waktu]` on the table `AbsenSholat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hari` to the `AbsenKelas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hari` to the `AbsenSholat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AbsenKelas` DROP FOREIGN KEY `AbsenKelas_absensiId_fkey`;

-- DropForeignKey
ALTER TABLE `AbsenSholat` DROP FOREIGN KEY `AbsenSholat_absensiId_fkey`;

-- DropIndex
DROP INDEX `AbsenKelas_absensiId_santriId_sesi_key` ON `AbsenKelas`;

-- DropIndex
DROP INDEX `AbsenSholat_absensiId_santriId_waktu_key` ON `AbsenSholat`;

-- AlterTable
ALTER TABLE `AbsenKelas` ADD COLUMN `hari` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `AbsenSholat` ADD COLUMN `hari` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `AbsenKelas_absensiId_santriId_hari_sesi_key` ON `AbsenKelas`(`absensiId`, `santriId`, `hari`, `sesi`);

-- CreateIndex
CREATE UNIQUE INDEX `AbsenSholat_absensiId_santriId_hari_waktu_key` ON `AbsenSholat`(`absensiId`, `santriId`, `hari`, `waktu`);

-- AddForeignKey
ALTER TABLE `AbsenSholat` ADD CONSTRAINT `AbsenSholat_absensiId_fkey` FOREIGN KEY (`absensiId`) REFERENCES `Absensi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenKelas` ADD CONSTRAINT `AbsenKelas_absensiId_fkey` FOREIGN KEY (`absensiId`) REFERENCES `Absensi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
