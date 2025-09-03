/*
  Warnings:

  - The `category` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentMethod` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Brand" DROP COLUMN "category",
ADD COLUMN     "category" "public"."Category",
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "public"."PaymentMethod";

-- CreateIndex
CREATE UNIQUE INDEX "Brand_userId_key" ON "public"."Brand"("userId");
