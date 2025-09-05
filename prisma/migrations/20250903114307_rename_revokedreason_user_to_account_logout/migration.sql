/*
  Warnings:

  - The values [USER_LOGOUT] on the enum `RevokedReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."RevokedReason_new" AS ENUM ('ACCOUNT_LOGOUT', 'EXPIRED', 'ADMIN_REVOKED', 'PASSWORD_CHANGE', 'TOKEN_REUSE_DETECTED', 'ROTATED', 'OTHER');
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "revokedReason" TYPE "public"."RevokedReason_new" USING ("revokedReason"::text::"public"."RevokedReason_new");
ALTER TYPE "public"."RevokedReason" RENAME TO "RevokedReason_old";
ALTER TYPE "public"."RevokedReason_new" RENAME TO "RevokedReason";
DROP TYPE "public"."RevokedReason_old";
COMMIT;
