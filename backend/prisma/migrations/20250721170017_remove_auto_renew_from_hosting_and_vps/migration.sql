/*
  Warnings:

  - You are about to drop the column `autoRenew` on the `hosting` table. All the data in the column will be lost.
  - You are about to drop the column `autoRenew` on the `vps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hosting` DROP COLUMN `autoRenew`;

-- AlterTable
ALTER TABLE `vps` DROP COLUMN `autoRenew`;
