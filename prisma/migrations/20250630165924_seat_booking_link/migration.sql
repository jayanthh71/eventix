/*
  Warnings:

  - You are about to drop the column `seatId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `isBooked` on the `Seat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,date,location,showtime,row,number]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingId` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `showtime` to the `Seat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_seatId_fkey";

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_eventId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "seatId";

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "isBooked",
ADD COLUMN     "bookingId" TEXT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "showtime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Seat_eventId_date_location_showtime_row_number_key" ON "Seat"("eventId", "date", "location", "showtime", "row", "number");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
