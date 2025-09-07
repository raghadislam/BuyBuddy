/*
  Warnings:

  - You are about to drop the column `street` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `payments` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "street",
ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "landmark" TEXT;

-- AlterTable
ALTER TABLE "public"."Brand" DROP COLUMN "category",
DROP COLUMN "paymentMethod",
ADD COLUMN     "categories" "public"."Category"[],
ADD COLUMN     "paymentMethods" "public"."PaymentMethod"[];

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "payments",
ADD COLUMN     "paymentMethods" "public"."PaymentMethod"[];
