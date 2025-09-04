/*
  Warnings:

  - Added the required column `updatedAt` to the `PrivateConversationParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PrivateMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PrivateMessageAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PrivateConversationParticipant" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PrivateMessage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PrivateMessageAttachment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
