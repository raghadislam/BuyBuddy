-- AlterTable
ALTER TABLE "public"."Brand" ADD COLUMN     "photoPublicId" TEXT,
ALTER COLUMN "logo" SET DEFAULT 'https://res.cloudinary.com/dbmr1movf/image/upload/v1757365829/default_j4wib4.jpg';
