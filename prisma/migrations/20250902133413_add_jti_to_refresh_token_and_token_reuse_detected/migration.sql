/*
  Warnings:

  - Added the required column `jti` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."RevokedReason" ADD VALUE 'TOKEN_REUSE_DETECTED';

-- AlterTable
ALTER TABLE "public"."RefreshToken" ADD COLUMN     "jti" TEXT NOT NULL;
