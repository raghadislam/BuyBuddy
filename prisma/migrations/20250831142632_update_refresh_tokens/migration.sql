-- AlterTable
ALTER TABLE "public"."RefreshToken" ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedReason" TEXT;
