/*
  Warnings:

  - The `revokedReason` column on the `RefreshToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."RevokedReason" AS ENUM ('USER_LOGOUT', 'EXPIRED', 'ADMIN_REVOKED', 'PASSWORD_CHANGE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "revokedReason",
ADD COLUMN     "revokedReason" "public"."RevokedReason";
