/*
  Warnings:

  - You are about to drop the column `renewalPrice` on the `domains` table. All the data in the column will be lost.
  - You are about to drop the column `renewalPrice` on the `hosting` table. All the data in the column will be lost.
  - You are about to drop the column `renewalPrice` on the `vps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `domains` DROP COLUMN `renewalPrice`,
    MODIFY `status` ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED', 'TRANSFERRED', 'DELETED', 'AVAILABLE_TO_ORDER') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `hosting` DROP COLUMN `renewalPrice`;

-- AlterTable
ALTER TABLE `vps` DROP COLUMN `renewalPrice`;
