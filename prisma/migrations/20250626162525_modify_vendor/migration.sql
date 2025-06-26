/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Train` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Train" DROP CONSTRAINT "Train_vendorId_fkey";

-- AlterTable
ALTER TABLE "Train" DROP COLUMN "vendorId";
