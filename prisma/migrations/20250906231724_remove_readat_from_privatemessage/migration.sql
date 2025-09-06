/*
  Warnings:

  - You are about to drop the column `readAt` on the `PrivateMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."PrivateMessage" DROP COLUMN "readAt";
