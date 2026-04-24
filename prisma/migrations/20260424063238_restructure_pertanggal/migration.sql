-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Admin_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Santri` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Absensi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipe` ENUM('SHOLAT', 'KELAS') NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Absensi_tipe_tanggal_key`(`tipe`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbsenSholat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `absensiId` INTEGER NOT NULL,
    `santriId` INTEGER NOT NULL,
    `waktu` VARCHAR(191) NOT NULL,
    `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TELAT', 'KOSONG') NOT NULL DEFAULT 'KOSONG',

    UNIQUE INDEX `AbsenSholat_absensiId_santriId_waktu_key`(`absensiId`, `santriId`, `waktu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AbsenKelas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `absensiId` INTEGER NOT NULL,
    `santriId` INTEGER NOT NULL,
    `sesi` VARCHAR(191) NOT NULL,
    `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TELAT', 'KOSONG') NOT NULL DEFAULT 'KOSONG',

    UNIQUE INDEX `AbsenKelas_absensiId_santriId_sesi_key`(`absensiId`, `santriId`, `sesi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AbsenSholat` ADD CONSTRAINT `AbsenSholat_absensiId_fkey` FOREIGN KEY (`absensiId`) REFERENCES `Absensi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenSholat` ADD CONSTRAINT `AbsenSholat_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `Santri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenKelas` ADD CONSTRAINT `AbsenKelas_absensiId_fkey` FOREIGN KEY (`absensiId`) REFERENCES `Absensi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsenKelas` ADD CONSTRAINT `AbsenKelas_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `Santri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
