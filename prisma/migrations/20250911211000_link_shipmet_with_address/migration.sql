/*
  Warnings:

  - You are about to drop the column `location` on the `ShipmentEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ShipmentEvent" DROP COLUMN "location",
ADD COLUMN     "addressId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."ShipmentEvent" ADD CONSTRAINT "ShipmentEvent_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
