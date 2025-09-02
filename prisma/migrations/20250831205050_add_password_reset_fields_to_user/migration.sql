-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "passwordResetCode" TEXT,
ADD COLUMN     "passwordResetCodeExpiresAt" TIMESTAMP(3);
