-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('TEXT', 'IMAGE');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('LIKE', 'LOVE', 'ADMIRE');

-- CreateTable
CREATE TABLE "public"."PrivateConversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "lastMessageId" TEXT,
    "lastMessageAt" TIMESTAMP(3),

    CONSTRAINT "PrivateConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivateConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PrivateConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivateMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT,
    "contentType" "public"."ContentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "reactionType" "public"."ReactionType",
    "reactedById" TEXT,

    CONSTRAINT "PrivateMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivateMessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivateConversation_lastMessageId_key" ON "public"."PrivateConversation"("lastMessageId");

-- CreateIndex
CREATE INDEX "PrivateConversation_updatedAt_idx" ON "public"."PrivateConversation"("updatedAt");

-- CreateIndex
CREATE INDEX "PrivateConversation_lastMessageAt_idx" ON "public"."PrivateConversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "PrivateConversationParticipant_accountId_idx" ON "public"."PrivateConversationParticipant"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateConversationParticipant_conversationId_accountId_key" ON "public"."PrivateConversationParticipant"("conversationId", "accountId");

-- CreateIndex
CREATE INDEX "PrivateMessage_conversationId_createdAt_idx" ON "public"."PrivateMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "PrivateMessage_senderId_createdAt_idx" ON "public"."PrivateMessage"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "PrivateMessageAttachment_messageId_idx" ON "public"."PrivateMessageAttachment"("messageId");

-- AddForeignKey
ALTER TABLE "public"."PrivateConversation" ADD CONSTRAINT "PrivateConversation_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "public"."PrivateMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateConversationParticipant" ADD CONSTRAINT "PrivateConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."PrivateConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateConversationParticipant" ADD CONSTRAINT "PrivateConversationParticipant_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessage" ADD CONSTRAINT "PrivateMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."PrivateConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessage" ADD CONSTRAINT "PrivateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessage" ADD CONSTRAINT "PrivateMessage_reactedById_fkey" FOREIGN KEY ("reactedById") REFERENCES "public"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessageAttachment" ADD CONSTRAINT "PrivateMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
