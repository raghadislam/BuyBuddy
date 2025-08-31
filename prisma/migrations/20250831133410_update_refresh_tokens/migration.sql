/*
  Warnings:

  - You are about to drop the column `expiredAt` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."RefreshToken_expiredAt_idx";

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "expiredAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");
