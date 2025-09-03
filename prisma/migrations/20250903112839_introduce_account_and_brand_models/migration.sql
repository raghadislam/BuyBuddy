/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetCodeExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCodeExpiresAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "public"."Brand" DROP CONSTRAINT "Brand_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropIndex
DROP INDEX "public"."Brand_userId_key";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- DropIndex
DROP INDEX "public"."User_provider_providerId_key";

-- DropIndex
DROP INDEX "public"."User_role_idx";

-- DropIndex
DROP INDEX "public"."User_status_idx";

-- AlterTable
ALTER TABLE "public"."Brand" DROP COLUMN "logoUrl",
DROP COLUMN "name",
DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "passwordResetCode",
DROP COLUMN "passwordResetCodeExpiresAt",
DROP COLUMN "provider",
DROP COLUMN "providerId",
DROP COLUMN "role",
DROP COLUMN "status",
DROP COLUMN "verificationCode",
DROP COLUMN "verificationCodeExpiresAt",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "gender" "public"."Gender",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "userName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'UNVERIFIED',
    "verificationCode" TEXT,
    "verificationCodeExpiresAt" TIMESTAMP(3),
    "passwordResetCode" TEXT,
    "passwordResetCodeExpiresAt" TIMESTAMP(3),
    "provider" "public"."Provider" NOT NULL DEFAULT 'LOCAL',
    "providerId" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "public"."Account"("email");

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "public"."Account"("status");

-- CreateIndex
CREATE INDEX "Account_role_idx" ON "public"."Account"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerId_key" ON "public"."Account"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_accountId_key" ON "public"."Brand"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "public"."User"("accountId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Brand" ADD CONSTRAINT "Brand_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
