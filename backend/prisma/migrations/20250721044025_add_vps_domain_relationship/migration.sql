/*
  Warnings:

  - You are about to drop the column `location` on the `vps` table. All the data in the column will be lost.
  - You are about to drop the column `os` on the `vps` table. All the data in the column will be lost.
  - You are about to drop the `_DomainToHosting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_DomainToHosting` DROP FOREIGN KEY `_DomainToHosting_A_fkey`;

-- DropForeignKey
ALTER TABLE `_DomainToHosting` DROP FOREIGN KEY `_DomainToHosting_B_fkey`;

-- AlterTable
ALTER TABLE `domains` ADD COLUMN `hostingId` VARCHAR(191) NULL,
    ADD COLUMN `vpsId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `vps` DROP COLUMN `location`,
    DROP COLUMN `os`,
    ADD COLUMN `cpanelUrl` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_DomainToHosting`;

-- CreateIndex
CREATE INDEX `domains_hostingId_idx` ON `domains`(`hostingId`);

-- CreateIndex
CREATE INDEX `domains_vpsId_idx` ON `domains`(`vpsId`);

-- AddForeignKey
ALTER TABLE `domains` ADD CONSTRAINT `domains_hostingId_fkey` FOREIGN KEY (`hostingId`) REFERENCES `hosting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `domains` ADD CONSTRAINT `domains_vpsId_fkey` FOREIGN KEY (`vpsId`) REFERENCES `vps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
