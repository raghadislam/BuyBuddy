/*
  Warnings:

  - You are about to alter the column `priceSnapshot` on the `CartItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `itemsTotal` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `priceSnapshot` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `avgRating` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `rating` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `price` on the `Variant` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "public"."CartItem" ALTER COLUMN "priceSnapshot" SET DEFAULT 0,
ALTER COLUMN "priceSnapshot" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "itemsTotal" SET DEFAULT 0,
ALTER COLUMN "itemsTotal" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."OrderItem" ALTER COLUMN "priceSnapshot" SET DEFAULT 0,
ALTER COLUMN "priceSnapshot" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Payment" ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "avgRating" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Review" ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Variant" ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);
