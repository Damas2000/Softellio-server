/*
  Warnings:

  - You are about to drop the column `lastCheckedAt` on the `tenant_domains` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `tenant_domains` table. All the data in the column will be lost.
  - You are about to drop the column `responseTime` on the `tenant_domains` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tenant_domains` table. All the data in the column will be lost.
  - The `type` column on the `tenant_domains` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sslStatus` column on the `tenant_domains` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DomainType" AS ENUM ('SYSTEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DomainSSLStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trial', 'active', 'expired', 'canceled', 'past_due');

-- CreateEnum
CREATE TYPE "PlanKey" AS ENUM ('basic', 'pro', 'custom');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('HOME', 'SERVICES', 'CONTACT', 'ABOUT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NavItemType" AS ENUM ('PAGE', 'EXTERNAL', 'DROPDOWN');

-- AlterTable
ALTER TABLE "tenant_domains" DROP COLUMN "lastCheckedAt",
DROP COLUMN "metadata",
DROP COLUMN "responseTime",
DROP COLUMN "status",
DROP COLUMN "type",
ADD COLUMN     "type" "DomainType" NOT NULL DEFAULT 'CUSTOM',
DROP COLUMN "sslStatus",
ADD COLUMN     "sslStatus" "DomainSSLStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "planKey" "PlanKey" NOT NULL DEFAULT 'basic',
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'trial';

-- CreateTable
CREATE TABLE "user_activities" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tenantId" INTEGER,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_settings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#6B7280',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#111827',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter, sans-serif',
    "radius" INTEGER NOT NULL DEFAULT 8,
    "shadowLevel" INTEGER NOT NULL DEFAULT 1,
    "containerMaxWidth" INTEGER NOT NULL DEFAULT 1200,
    "gridGap" INTEGER NOT NULL DEFAULT 24,
    "buttonStyle" TEXT NOT NULL DEFAULT 'solid',
    "headerVariant" TEXT NOT NULL DEFAULT 'default',
    "footerVariant" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_layouts" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "language" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "layoutId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "variant" TEXT,
    "order" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'published',
    "propsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "previewImage" TEXT,
    "supportedSections" TEXT[],
    "defaultLayout" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_site_configs" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "templateKey" TEXT NOT NULL,
    "branding" JSONB NOT NULL,
    "navigation" JSONB NOT NULL,
    "footer" JSONB NOT NULL,
    "seoDefaults" JSONB,
    "customCSS" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_site_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_pages" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "layoutKey" TEXT NOT NULL,
    "seo" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "pageType" "PageType" NOT NULL DEFAULT 'CUSTOM',
    "language" TEXT NOT NULL DEFAULT 'tr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activities_userId_tenantId_idx" ON "user_activities"("userId", "tenantId");

-- CreateIndex
CREATE INDEX "user_activities_userId_createdAt_idx" ON "user_activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_tenantId_createdAt_idx" ON "user_activities"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_action_createdAt_idx" ON "user_activities"("action", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_createdAt_idx" ON "user_activities"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "theme_settings_tenantId_key" ON "theme_settings"("tenantId");

-- CreateIndex
CREATE INDEX "theme_settings_tenantId_idx" ON "theme_settings"("tenantId");

-- CreateIndex
CREATE INDEX "page_layouts_tenantId_key_idx" ON "page_layouts"("tenantId", "key");

-- CreateIndex
CREATE INDEX "page_layouts_tenantId_language_idx" ON "page_layouts"("tenantId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "page_layouts_tenantId_key_language_key" ON "page_layouts"("tenantId", "key", "language");

-- CreateIndex
CREATE INDEX "page_sections_tenantId_layoutId_idx" ON "page_sections"("tenantId", "layoutId");

-- CreateIndex
CREATE INDEX "page_sections_tenantId_type_idx" ON "page_sections"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_layoutId_order_key" ON "page_sections"("layoutId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "templates_key_key" ON "templates"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_site_configs_tenantId_key" ON "tenant_site_configs"("tenantId");

-- CreateIndex
CREATE INDEX "dynamic_pages_tenantId_published_idx" ON "dynamic_pages"("tenantId", "published");

-- CreateIndex
CREATE INDEX "dynamic_pages_tenantId_pageType_idx" ON "dynamic_pages"("tenantId", "pageType");

-- CreateIndex
CREATE UNIQUE INDEX "dynamic_pages_tenantId_slug_language_key" ON "dynamic_pages"("tenantId", "slug", "language");

-- CreateIndex
CREATE INDEX "tenant_domains_type_isActive_idx" ON "tenant_domains"("type", "isActive");

-- CreateIndex
CREATE INDEX "tenant_domains_tenantId_isVerified_idx" ON "tenant_domains"("tenantId", "isVerified");

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_layouts" ADD CONSTRAINT "page_layouts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "page_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_site_configs" ADD CONSTRAINT "tenant_site_configs_templateKey_fkey" FOREIGN KEY ("templateKey") REFERENCES "templates"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_site_configs" ADD CONSTRAINT "tenant_site_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dynamic_pages" ADD CONSTRAINT "dynamic_pages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
