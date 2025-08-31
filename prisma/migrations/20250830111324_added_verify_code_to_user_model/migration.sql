-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('UNVERIFIED', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpiresAt" TIMESTAMP(3);
