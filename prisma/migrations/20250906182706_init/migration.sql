-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MANAGER', 'ADMIN', 'BRAND', 'USER', 'GUEST');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('UNVERIFIED', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."RevokedReason" AS ENUM ('ACCOUNT_LOGOUT', 'EXPIRED', 'ADMIN_REVOKED', 'PASSWORD_CHANGE', 'TOKEN_REUSE_DETECTED', 'ROTATED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "public"."BrandStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'ARCHIVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH_ON_DELIVERY', 'APPLE_PAY', 'GOOGLE_PAY', 'FAWRY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('FASHION', 'HOME', 'BEAUTY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('TEXT', 'IMAGE');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('LIKE', 'LOVE', 'ADMIRE');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'UNVERIFIED',
    "verificationCode" TEXT,
    "verificationCodeExpiresAt" TIMESTAMP(3),
    "passwordResetCode" TEXT,
    "passwordResetCodeExpiresAt" TIMESTAMP(3),
    "provider" "public"."Provider" NOT NULL DEFAULT 'LOCAL',
    "providerId" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "photo" TEXT,
    "phone" TEXT,
    "gender" "public"."Gender",
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "payments" "public"."PaymentMethod"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "government" TEXT,
    "city" TEXT,
    "street" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "category" "public"."Category"[],
    "status" "public"."BrandStatus" NOT NULL DEFAULT 'DRAFT',
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "bussinessPhone" TEXT,
    "ownerName" TEXT,
    "ownerNationalId" TEXT,
    "ownerPhone" TEXT,
    "crn" TEXT,
    "taxId" TEXT,
    "paymentMethod" "public"."PaymentMethod"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" "public"."RevokedReason",
    "jti" TEXT NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivateConversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "PrivateConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivateConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivateMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateMessageAttachment_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "category" "public"."Category" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "attributes" JSONB,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "material" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "meta" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductOptionValue" (
    "id" TEXT NOT NULL,
    "productOptionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "colorHex" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariantOption" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productOptionId" TEXT NOT NULL,
    "productOptionValueId" TEXT NOT NULL,

    CONSTRAINT "VariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "weight" DECIMAL(10,3),
    "dimensions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariantImage" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VariantImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductTag" (
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("productId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "public"."Account"("email");

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "public"."Account"("status");

-- CreateIndex
CREATE INDEX "Account_role_idx" ON "public"."Account"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerId_key" ON "public"."Account"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "public"."User"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "public"."User"("userName");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "public"."Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_accountId_key" ON "public"."Brand"("accountId");

-- CreateIndex
CREATE INDEX "Brand_status_idx" ON "public"."Brand"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "public"."RefreshToken"("jti");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PrivateConversation_updatedAt_idx" ON "public"."PrivateConversation"("updatedAt");

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

-- CreateIndex
CREATE INDEX "PrivateMessageVisibility_accountId_idx" ON "public"."PrivateMessageVisibility"("accountId");

-- CreateIndex
CREATE INDEX "PrivateMessageVisibility_messageId_idx" ON "public"."PrivateMessageVisibility"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateMessageVisibility_messageId_accountId_key" ON "public"."PrivateMessageVisibility"("messageId", "accountId");

-- CreateIndex
CREATE INDEX "Product_category_status_createdAt_idx" ON "public"."Product"("category", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Product_material_idx" ON "public"."Product"("material");

-- CreateIndex
CREATE UNIQUE INDEX "Product_brandId_slug_key" ON "public"."Product"("brandId", "slug");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "public"."ProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_sortOrder_key" ON "public"."ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductOption_productId_sortOrder_idx" ON "public"."ProductOption"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_productId_name_key" ON "public"."ProductOption"("productId", "name");

-- CreateIndex
CREATE INDEX "ProductOptionValue_productOptionId_sortOrder_idx" ON "public"."ProductOptionValue"("productOptionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionValue_productOptionId_value_key" ON "public"."ProductOptionValue"("productOptionId", "value");

-- CreateIndex
CREATE INDEX "VariantOption_productOptionValueId_idx" ON "public"."VariantOption"("productOptionValueId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantOption_variantId_productOptionId_key" ON "public"."VariantOption"("variantId", "productOptionId");

-- CreateIndex
CREATE INDEX "Variant_productId_idx" ON "public"."Variant"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_productId_sku_key" ON "public"."Variant"("productId", "sku");

-- CreateIndex
CREATE INDEX "VariantImage_variantId_idx" ON "public"."VariantImage"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantImage_variantId_sortOrder_key" ON "public"."VariantImage"("variantId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "public"."Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "public"."Tag"("name");

-- CreateIndex
CREATE INDEX "ProductTag_tagId_productId_idx" ON "public"."ProductTag"("tagId", "productId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Brand" ADD CONSTRAINT "Brand_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateConversationParticipant" ADD CONSTRAINT "PrivateConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."PrivateConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateConversationParticipant" ADD CONSTRAINT "PrivateConversationParticipant_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessage" ADD CONSTRAINT "PrivateMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."PrivateConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessage" ADD CONSTRAINT "PrivateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessage" ADD CONSTRAINT "PrivateMessage_reactedById_fkey" FOREIGN KEY ("reactedById") REFERENCES "public"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessageAttachment" ADD CONSTRAINT "PrivateMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessageVisibility" ADD CONSTRAINT "PrivateMessageVisibility_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."PrivateMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivateMessageVisibility" ADD CONSTRAINT "PrivateMessageVisibility_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_productOptionId_fkey" FOREIGN KEY ("productOptionId") REFERENCES "public"."ProductOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantOption" ADD CONSTRAINT "VariantOption_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantOption" ADD CONSTRAINT "VariantOption_productOptionId_fkey" FOREIGN KEY ("productOptionId") REFERENCES "public"."ProductOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantOption" ADD CONSTRAINT "VariantOption_productOptionValueId_fkey" FOREIGN KEY ("productOptionValueId") REFERENCES "public"."ProductOptionValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantImage" ADD CONSTRAINT "VariantImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTag" ADD CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTag" ADD CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
