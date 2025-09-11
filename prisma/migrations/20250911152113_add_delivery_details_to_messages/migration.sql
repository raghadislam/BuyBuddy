-- AlterTable
ALTER TABLE "public"."PrivateMessage" ADD COLUMN     "isDelivered" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."PrivateMessageVisibility" ADD COLUMN     "deliveredAt" TIMESTAMP(3);
