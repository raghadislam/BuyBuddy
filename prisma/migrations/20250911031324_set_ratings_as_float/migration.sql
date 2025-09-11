/*
  Warnings:

  - You are about to alter the column `avgRating` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `DoublePrecision`.
  - You are about to alter the column `rating` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `DoublePrecision`.
  - Changed the type of `provider` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "provider",
ADD COLUMN     "provider" "public"."PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "avgRating" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Review" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;
