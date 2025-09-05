-- CreateTable
CREATE TABLE "public"."PrivateMessageVisibility" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateMessageVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrivateMessageVisibility_accountId_idx" ON "public"."PrivateMessageVisibility"("accountId");

-- CreateIndex
CREATE INDEX "PrivateMessageVisibility_messageId_idx" ON "public"."PrivateMessageVisibility"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateMessageVisibility_messageId_accountId_key" ON "public"."PrivateMessageVisibility"("messageId", "accountId");

-- AddForeignKey
ALTER TABLE "public"."PrivateMessageVisibility" ADD CONSTRAINT "PrivateMessageVisibility_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessageVisibility" ADD CONSTRAINT "PrivateMessageVisibility_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
