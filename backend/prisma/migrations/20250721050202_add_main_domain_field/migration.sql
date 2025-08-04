-- AlterTable
ALTER TABLE `domains` ADD COLUMN `isMainDomain` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `domains_isMainDomain_idx` ON `domains`(`isMainDomain`);
