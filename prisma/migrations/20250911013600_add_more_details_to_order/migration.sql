/*
  Warnings:

  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `subtotal` on the `SubOrder` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - Added the required column `itemsTotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "total",
ADD COLUMN     "discountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "itemsTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "shippingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."SubOrder" ADD COLUMN     "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shippingFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(12,2);
