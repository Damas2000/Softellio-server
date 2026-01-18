-- CreateIndex
CREATE INDEX "page_translations_language_slug_idx" ON "page_translations"("language", "slug");

-- CreateIndex
CREATE INDEX "page_translations_pageId_language_idx" ON "page_translations"("pageId", "language");

-- CreateIndex
CREATE INDEX "page_translations_slug_idx" ON "page_translations"("slug");

-- CreateIndex
CREATE INDEX "pages_tenantId_status_idx" ON "pages"("tenantId", "status");

-- CreateIndex
CREATE INDEX "pages_tenantId_createdAt_idx" ON "pages"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "pages_tenantId_updatedAt_idx" ON "pages"("tenantId", "updatedAt");
