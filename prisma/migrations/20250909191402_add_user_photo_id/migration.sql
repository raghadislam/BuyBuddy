-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "photoPublicId" TEXT,
ALTER COLUMN "photo" SET DEFAULT 'https://res.cloudinary.com/dbmr1movf/image/upload/v1757365829/default_j4wib4.jpg';
