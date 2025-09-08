/*
  Warnings:

  - A unique constraint covering the columns `[productId,userId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Review_productId_rating_createdAt_idx" ON "public"."Review"("productId", "rating", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_userId_createdAt_idx" ON "public"."Review"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Review_productId_userId_key" ON "public"."Review"("productId", "userId");
