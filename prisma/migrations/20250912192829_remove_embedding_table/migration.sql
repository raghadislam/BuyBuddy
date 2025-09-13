/*
  Warnings:

  - You are about to drop the `ProductImageEmbedding` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductImageEmbedding" DROP CONSTRAINT "ProductImageEmbedding_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductImageEmbedding" DROP CONSTRAINT "ProductImageEmbedding_productImageId_fkey";

-- DropTable
DROP TABLE "public"."ProductImageEmbedding";
