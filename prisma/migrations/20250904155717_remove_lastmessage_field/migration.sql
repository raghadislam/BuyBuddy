/*
  Warnings:

  - You are about to drop the column `lastMessageAt` on the `PrivateConversation` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageId` on the `PrivateConversation` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `PrivateMessageAttachment` table. All the data in the column will be lost.
  - Made the column `senderId` on table `PrivateMessage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `PrivateMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."PrivateConversation" DROP CONSTRAINT "PrivateConversation_lastMessageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrivateMessage" DROP CONSTRAINT "PrivateMessage_senderId_fkey";

-- DropIndex
DROP INDEX "public"."PrivateConversation_lastMessageAt_idx";

-- DropIndex
DROP INDEX "public"."PrivateConversation_lastMessageId_key";

-- AlterTable
ALTER TABLE "public"."PrivateConversation" DROP COLUMN "lastMessageAt",
DROP COLUMN "lastMessageId";

-- AlterTable
ALTER TABLE "public"."PrivateMessage" ALTER COLUMN "senderId" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PrivateMessageAttachment" DROP COLUMN "size";

-- AddForeignKey
ALTER TABLE "public"."PrivateMessage" ADD CONSTRAINT "PrivateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
