/*
  Warnings:

  - A unique constraint covering the columns `[DAuthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('EMAIL', 'DAUTH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "DAuthId" TEXT,
ADD COLUMN     "authMethod" "AuthMethod" NOT NULL DEFAULT 'EMAIL',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_DAuthId_key" ON "User"("DAuthId");
