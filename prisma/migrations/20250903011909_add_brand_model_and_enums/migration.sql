/*
  Warnings:

  - The values [SELLER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."BrandStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH_ON_DELIVERY', 'APPLE_PAY', 'GOOGLE_PAY', 'FAWRY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('FASHION', 'HOME', 'BEAUTY', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('MANAGER', 'ADMIN', 'BRAND', 'USER', 'GUEST');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "category" TEXT,
    "status" "public"."BrandStatus" NOT NULL DEFAULT 'DRAFT',
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "ownerName" TEXT,
    "ownerNationalId" TEXT,
    "ownerPhone" TEXT,
    "crn" TEXT,
    "taxId" TEXT,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brand_status_idx" ON "public"."Brand"("status");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- AddForeignKey
ALTER TABLE "public"."Brand" ADD CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
