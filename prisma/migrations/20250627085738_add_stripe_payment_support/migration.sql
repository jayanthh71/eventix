/*
  Warnings:

  - A unique constraint covering the columns `[paymentIntentId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WALLET', 'STRIPE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'WALLET';

-- CreateIndex
CREATE UNIQUE INDEX "Booking_paymentIntentId_key" ON "Booking"("paymentIntentId");
