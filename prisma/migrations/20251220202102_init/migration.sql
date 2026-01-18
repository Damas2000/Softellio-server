-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ModuleName" AS ENUM ('PAGES', 'BLOG', 'MENU', 'MEDIA', 'SETTINGS');

-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'tr',
    "availableLanguages" TEXT[] DEFAULT ARRAY['tr']::TEXT[],
    "theme" TEXT,
    "primaryColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER,
    "role" "Role" NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_features" (
    "tenantId" INTEGER NOT NULL,
    "module" "ModuleName" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tenant_features_pkey" PRIMARY KEY ("tenantId","module")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_translations" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contentJson" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_category_translations" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "blog_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "authorId" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_translations" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "contentJson" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "blog_post_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "order" INTEGER,
    "pageId" INTEGER,
    "externalUrl" TEXT,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_translations" (
    "id" SERIAL NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "menu_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "format" TEXT,
    "size" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" INTEGER,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_setting_translations" (
    "id" SERIAL NOT NULL,
    "siteSettingId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteDescription" TEXT,
    "seoMetaTitle" TEXT,
    "seoMetaDescription" TEXT,

    CONSTRAINT "site_setting_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_translations" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "contentJson" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member_translations" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "expertise" TEXT,

    CONSTRAINT "team_member_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "references" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "projectUrl" TEXT,
    "clientName" TEXT,
    "projectDate" TIMESTAMP(3),
    "category" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_translations" (
    "id" SERIAL NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "contentJson" JSONB,
    "metaTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "reference_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_gallery" (
    "id" SERIAL NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER,

    CONSTRAINT "reference_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "logo" TEXT,
    "favicon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info_translations" (
    "id" SERIAL NOT NULL,
    "contactInfoId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "workingHours" TEXT,

    CONSTRAINT "contact_info_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offices" (
    "id" SERIAL NOT NULL,
    "contactInfoId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "address" TEXT,
    "mapUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_links" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "contactInfoId" INTEGER,
    "teamMemberId" INTEGER,

    CONSTRAINT "social_media_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'slider',
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "linkUrl" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_translations" (
    "id" SERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "buttonText" TEXT,
    "altText" TEXT,

    CONSTRAINT "banner_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientTitle" TEXT,
    "clientImage" TEXT,
    "rating" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonial_translations" (
    "id" SERIAL NOT NULL,
    "testimonialId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "projectName" TEXT,

    CONSTRAINT "testimonial_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sliders" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'carousel',
    "autoPlay" BOOLEAN NOT NULL DEFAULT true,
    "autoPlaySpeed" INTEGER NOT NULL DEFAULT 5000,
    "showDots" BOOLEAN NOT NULL DEFAULT true,
    "showArrows" BOOLEAN NOT NULL DEFAULT true,
    "infinite" BOOLEAN NOT NULL DEFAULT true,
    "slidesToShow" INTEGER NOT NULL DEFAULT 1,
    "slidesToScroll" INTEGER NOT NULL DEFAULT 1,
    "responsive" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slider_translations" (
    "id" SERIAL NOT NULL,
    "sliderId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "slider_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slider_items" (
    "id" SERIAL NOT NULL,
    "sliderId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "tabletImageUrl" TEXT,
    "videoUrl" TEXT,
    "linkUrl" TEXT,
    "linkTarget" TEXT NOT NULL DEFAULT '_self',
    "overlayColor" TEXT,
    "overlayOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "textPosition" TEXT NOT NULL DEFAULT 'center',
    "animationIn" TEXT NOT NULL DEFAULT 'fadeIn',
    "animationOut" TEXT NOT NULL DEFAULT 'fadeOut',
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slider_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slider_item_translations" (
    "id" SERIAL NOT NULL,
    "sliderItemId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "buttonText" TEXT,
    "buttonColor" TEXT,
    "altText" TEXT,

    CONSTRAINT "slider_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_positions" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "maxBanners" INTEGER NOT NULL DEFAULT 1,
    "autoRotate" BOOLEAN NOT NULL DEFAULT false,
    "rotateSpeed" INTEGER NOT NULL DEFAULT 10000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_position_assignments" (
    "id" SERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_position_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_settings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "robotsTxt" TEXT,
    "sitemap" BOOLEAN NOT NULL DEFAULT true,
    "analyticsCode" TEXT,
    "gtagCode" TEXT,
    "facebookPixel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_setting_translations" (
    "id" SERIAL NOT NULL,
    "seoSettingId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "metaKeywords" TEXT,
    "metaAuthor" TEXT,
    "metaCopyright" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,

    CONSTRAINT "seo_setting_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structured_data" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "schemaType" TEXT NOT NULL,
    "jsonLd" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "structured_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "priority" DOUBLE PRECISION,
    "changeFreq" TEXT,
    "customRobots" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo_translations" (
    "id" SERIAL NOT NULL,
    "pageSeoId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT DEFAULT 'website',
    "twitterCard" TEXT DEFAULT 'summary_large_image',
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,

    CONSTRAINT "page_seo_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirects" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "toUrl" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHit" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitemap_config" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "includePages" BOOLEAN NOT NULL DEFAULT true,
    "includeBlog" BOOLEAN NOT NULL DEFAULT true,
    "includeServices" BOOLEAN NOT NULL DEFAULT true,
    "includeTeam" BOOLEAN NOT NULL DEFAULT false,
    "includeReferences" BOOLEAN NOT NULL DEFAULT true,
    "includeGalleries" BOOLEAN NOT NULL DEFAULT false,
    "maxUrls" INTEGER NOT NULL DEFAULT 50000,
    "autoSubmit" BOOLEAN NOT NULL DEFAULT false,
    "lastGenerated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitemap_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_integrations" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "googleAnalyticsId" TEXT,
    "googleTagManagerId" TEXT,
    "googleSearchConsole" TEXT,
    "bingWebmasterTools" TEXT,
    "facebookDomainVerif" TEXT,
    "pinterestVerif" TEXT,
    "yandexVerif" TEXT,
    "customHeadScripts" TEXT,
    "customBodyScripts" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "og_templates" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "imageWidth" INTEGER DEFAULT 1200,
    "imageHeight" INTEGER DEFAULT 630,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "og_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "og_template_translations" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "titleTemplate" TEXT,
    "descTemplate" TEXT,

    CONSTRAINT "og_template_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galleries" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "coverImage" TEXT,
    "type" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_translations" (
    "id" SERIAL NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "gallery_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" SERIAL NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isReplied" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_analytics" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "socialLinkId" INTEGER,
    "platform" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "metricValue" INTEGER NOT NULL DEFAULT 0,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_media_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_configurations" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mapType" TEXT NOT NULL DEFAULT 'google',
    "provider" TEXT NOT NULL DEFAULT 'google',
    "apiKey" TEXT,
    "style" TEXT,
    "defaultZoom" INTEGER NOT NULL DEFAULT 15,
    "showMarkers" BOOLEAN NOT NULL DEFAULT true,
    "showInfoWindows" BOOLEAN NOT NULL DEFAULT true,
    "enableDirections" BOOLEAN NOT NULL DEFAULT true,
    "enableStreetView" BOOLEAN NOT NULL DEFAULT true,
    "markerColor" TEXT DEFAULT '#FF0000',
    "markerIcon" TEXT,
    "width" TEXT DEFAULT '100%',
    "height" TEXT DEFAULT '400px',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "map_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_categories" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_category_translations" (
    "id" SERIAL NOT NULL,
    "locationCategoryId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "location_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_assignments" (
    "id" SERIAL NOT NULL,
    "officeId" INTEGER NOT NULL,
    "mapConfigurationId" INTEGER,
    "locationCategoryId" INTEGER,
    "customMarkerIcon" TEXT,
    "customMarkerColor" TEXT,
    "showInWidget" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_shares" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_media_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_analytics" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "browserName" TEXT,
    "osName" TEXT,
    "country" TEXT,
    "city" TEXT,
    "language" TEXT,
    "pageUrl" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "pageTitle" TEXT,
    "referrer" TEXT,
    "entityType" TEXT,
    "entityId" INTEGER,
    "timeOnPage" INTEGER DEFAULT 0,
    "scrollDepth" INTEGER DEFAULT 0,
    "bounceRate" BOOLEAN NOT NULL DEFAULT false,
    "exitPage" BOOLEAN NOT NULL DEFAULT false,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "loadTime" INTEGER,
    "errors" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "website_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "query" JSONB,
    "filters" JSONB,
    "title" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "size" TEXT NOT NULL DEFAULT 'medium',
    "position" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "refreshInterval" INTEGER DEFAULT 300,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_reports" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reportType" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "dateRange" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "filters" JSONB,
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "recipients" TEXT[],
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_executions" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "recordCount" INTEGER,
    "errorMessage" TEXT,
    "executionData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER,
    "metricType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "category" TEXT NOT NULL,
    "component" TEXT,
    "warningThreshold" DOUBLE PRECISION,
    "criticalThreshold" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "metadata" JSONB,
    "tags" TEXT[],
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_analytics" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "contentTitle" TEXT,
    "contentSlug" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "averageTimeOnPage" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "organicTraffic" INTEGER NOT NULL DEFAULT 0,
    "searchImpressions" INTEGER NOT NULL DEFAULT 0,
    "searchClicks" INTEGER NOT NULL DEFAULT 0,
    "averagePosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_sessions" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "country" TEXT,
    "city" TEXT,
    "currentPage" TEXT NOT NULL,
    "pageTitle" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageViews" INTEGER NOT NULL DEFAULT 1,
    "timeOnSite" INTEGER NOT NULL DEFAULT 0,
    "referrer" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "active_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_goals" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goalType" TEXT NOT NULL,
    "targetUrl" TEXT,
    "targetElement" TEXT,
    "eventName" TEXT,
    "conditions" JSONB,
    "hasValue" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversion_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversions" (
    "id" SERIAL NOT NULL,
    "goalId" INTEGER NOT NULL,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "value" DOUBLE PRECISION,
    "currency" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "metadata" JSONB,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "general" TEXT,
    "security" TEXT,
    "email" TEXT,
    "fileUpload" TEXT,
    "cache" TEXT,
    "database" TEXT,
    "logging" TEXT,
    "performance" TEXT,
    "features" TEXT,
    "customSettings" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_backups" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "settingsData" TEXT NOT NULL,
    "settingsCount" INTEGER NOT NULL DEFAULT 0,
    "categories" TEXT[],
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "isCompressed" BOOLEAN NOT NULL DEFAULT true,
    "fileSize" INTEGER,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "configuration_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_entries" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "metadata" TEXT,
    "sessionId" TEXT,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" INTEGER,
    "duration" INTEGER,
    "statusCode" INTEGER,
    "method" TEXT,
    "url" TEXT,
    "stack" TEXT,
    "error" TEXT,
    "tags" TEXT[],
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metric" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "severity" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER,
    "cooldown" INTEGER,
    "notificationChannels" TEXT[],
    "recipients" TEXT[],
    "labels" TEXT,
    "annotations" TEXT,
    "runbook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "description" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "tenantId" INTEGER,
    "metric" TEXT NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "labels" TEXT,
    "annotations" TEXT,
    "lastNotifiedAt" TIMESTAMP(3),
    "notificationCount" INTEGER NOT NULL DEFAULT 0,
    "fingerprint" TEXT,
    "generatorURL" TEXT,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_windows" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "services" TEXT[],
    "silenceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "disableNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'http',
    "url" TEXT,
    "expectedStatus" INTEGER,
    "timeout" INTEGER NOT NULL DEFAULT 5000,
    "interval" INTEGER NOT NULL DEFAULT 60,
    "retries" INTEGER NOT NULL DEFAULT 3,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "headers" TEXT,
    "customScript" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_check_results" (
    "id" TEXT NOT NULL,
    "healthCheckId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "duration" INTEGER,
    "responseCode" INTEGER,
    "error" TEXT,
    "metadata" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_check_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_events" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitoring_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_domains" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "sslStatus" TEXT DEFAULT 'pending',
    "sslIssuedAt" TIMESTAMP(3),
    "sslExpiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "responseTime" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_backups" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "backupType" TEXT NOT NULL,
    "compressionType" TEXT NOT NULL DEFAULT 'gzip',
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "checksum" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "recordsCount" INTEGER,
    "tablesCount" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "retentionDays" INTEGER DEFAULT 30,
    "metadata" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "database_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_backups" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "backupType" TEXT NOT NULL,
    "includeDatabase" BOOLEAN NOT NULL DEFAULT true,
    "includeFiles" BOOLEAN NOT NULL DEFAULT true,
    "includeConfig" BOOLEAN NOT NULL DEFAULT true,
    "includeMedia" BOOLEAN NOT NULL DEFAULT true,
    "includeLogs" BOOLEAN NOT NULL DEFAULT false,
    "archivePath" TEXT,
    "archiveSize" INTEGER,
    "compressionRatio" DOUBLE PRECISION,
    "checksum" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentPhase" TEXT,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "filesCount" INTEGER,
    "foldersCount" INTEGER,
    "originalSize" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "retentionDays" INTEGER DEFAULT 7,
    "canRestore" BOOLEAN NOT NULL DEFAULT true,
    "restoreNotes" TEXT,
    "metadata" JSONB,
    "tags" TEXT[],
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_schedules" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scheduleType" TEXT NOT NULL,
    "backupType" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "compressionType" TEXT NOT NULL DEFAULT 'gzip',
    "maxBackups" INTEGER NOT NULL DEFAULT 10,
    "notifyOnSuccess" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "recipients" TEXT[],
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "maxDuration" INTEGER,
    "maxSize" INTEGER,
    "metadata" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restore_operations" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "backupId" TEXT,
    "backupType" TEXT NOT NULL,
    "restoreType" TEXT NOT NULL,
    "targetLocation" TEXT,
    "restoreDatabase" BOOLEAN NOT NULL DEFAULT true,
    "restoreFiles" BOOLEAN NOT NULL DEFAULT true,
    "restoreConfig" BOOLEAN NOT NULL DEFAULT true,
    "restoreMedia" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentPhase" TEXT,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "restoredFiles" INTEGER,
    "restoredSize" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "initiatedBy" INTEGER,
    "reason" TEXT,
    "approvedBy" INTEGER,
    "canRollback" BOOLEAN NOT NULL DEFAULT false,
    "rollbackData" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restore_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_updates" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "updateType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "currentVersion" TEXT,
    "packageUrl" TEXT,
    "packageSize" INTEGER,
    "packageChecksum" TEXT,
    "releaseNotes" TEXT,
    "requirements" JSONB,
    "dependencies" JSONB,
    "conflicts" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentPhase" TEXT,
    "errorMessage" TEXT,
    "preUpdateBackupId" TEXT,
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "canRollback" BOOLEAN NOT NULL DEFAULT true,
    "rollbackData" TEXT,
    "rolledBackAt" TIMESTAMP(3),
    "initiatedBy" INTEGER,
    "approvedBy" INTEGER,
    "testsPassed" BOOLEAN,
    "validationResults" JSONB,
    "notifyOnComplete" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "recipients" TEXT[],
    "metadata" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "page_translations_pageId_language_key" ON "page_translations"("pageId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "blog_category_translations_categoryId_language_key" ON "blog_category_translations"("categoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_translations_postId_language_key" ON "blog_post_translations"("postId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "menus_tenantId_key_key" ON "menus"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_translations_menuItemId_language_key" ON "menu_item_translations"("menuItemId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_tenantId_key" ON "site_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "site_setting_translations_siteSettingId_language_key" ON "site_setting_translations"("siteSettingId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_serviceId_language_key" ON "service_translations"("serviceId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_translations_teamId_language_key" ON "team_member_translations"("teamId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "reference_translations_referenceId_language_key" ON "reference_translations"("referenceId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "contact_info_tenantId_key" ON "contact_info"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_info_translations_contactInfoId_language_key" ON "contact_info_translations"("contactInfoId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "banner_translations_bannerId_language_key" ON "banner_translations"("bannerId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "testimonial_translations_testimonialId_language_key" ON "testimonial_translations"("testimonialId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "sliders_tenantId_key_key" ON "sliders"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "slider_translations_sliderId_language_key" ON "slider_translations"("sliderId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "slider_item_translations_sliderItemId_language_key" ON "slider_item_translations"("sliderItemId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "banner_positions_tenantId_key_key" ON "banner_positions"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "banner_position_assignments_bannerId_positionId_key" ON "banner_position_assignments"("bannerId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_settings_tenantId_key" ON "seo_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_setting_translations_seoSettingId_language_key" ON "seo_setting_translations"("seoSettingId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "structured_data_tenantId_entityType_entityId_key" ON "structured_data"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_tenantId_entityType_entityId_key" ON "page_seo"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_translations_pageSeoId_language_key" ON "page_seo_translations"("pageSeoId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "redirects_tenantId_fromUrl_key" ON "redirects"("tenantId", "fromUrl");

-- CreateIndex
CREATE UNIQUE INDEX "sitemap_config_tenantId_key" ON "sitemap_config"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_integrations_tenantId_key" ON "seo_integrations"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "og_templates_tenantId_name_key" ON "og_templates"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "og_template_translations_templateId_language_key" ON "og_template_translations"("templateId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_translations_galleryId_language_key" ON "gallery_translations"("galleryId", "language");

-- CreateIndex
CREATE INDEX "social_media_analytics_tenantId_platform_date_idx" ON "social_media_analytics"("tenantId", "platform", "date");

-- CreateIndex
CREATE UNIQUE INDEX "location_category_translations_locationCategoryId_language_key" ON "location_category_translations"("locationCategoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "location_assignments_officeId_mapConfigurationId_key" ON "location_assignments"("officeId", "mapConfigurationId");

-- CreateIndex
CREATE INDEX "social_media_shares_tenantId_entityType_entityId_idx" ON "social_media_shares"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "social_media_shares_tenantId_platform_sharedAt_idx" ON "social_media_shares"("tenantId", "platform", "sharedAt");

-- CreateIndex
CREATE INDEX "website_analytics_tenantId_visitedAt_idx" ON "website_analytics"("tenantId", "visitedAt");

-- CreateIndex
CREATE INDEX "website_analytics_tenantId_pageUrl_idx" ON "website_analytics"("tenantId", "pageUrl");

-- CreateIndex
CREATE INDEX "website_analytics_tenantId_sessionId_idx" ON "website_analytics"("tenantId", "sessionId");

-- CreateIndex
CREATE INDEX "website_analytics_tenantId_entityType_entityId_idx" ON "website_analytics"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "dashboard_widgets_tenantId_category_idx" ON "dashboard_widgets"("tenantId", "category");

-- CreateIndex
CREATE INDEX "dashboard_widgets_tenantId_isActive_idx" ON "dashboard_widgets"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "analytics_reports_tenantId_isScheduled_nextRunAt_idx" ON "analytics_reports"("tenantId", "isScheduled", "nextRunAt");

-- CreateIndex
CREATE INDEX "report_executions_reportId_status_idx" ON "report_executions"("reportId", "status");

-- CreateIndex
CREATE INDEX "system_metrics_tenantId_metricType_recordedAt_idx" ON "system_metrics"("tenantId", "metricType", "recordedAt");

-- CreateIndex
CREATE INDEX "system_metrics_tenantId_status_idx" ON "system_metrics"("tenantId", "status");

-- CreateIndex
CREATE INDEX "content_analytics_tenantId_date_idx" ON "content_analytics"("tenantId", "date");

-- CreateIndex
CREATE INDEX "content_analytics_tenantId_entityType_idx" ON "content_analytics"("tenantId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "content_analytics_tenantId_entityType_entityId_date_key" ON "content_analytics"("tenantId", "entityType", "entityId", "date");

-- CreateIndex
CREATE INDEX "active_sessions_tenantId_lastActivity_idx" ON "active_sessions"("tenantId", "lastActivity");

-- CreateIndex
CREATE INDEX "active_sessions_expiresAt_idx" ON "active_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "conversion_goals_tenantId_isActive_idx" ON "conversion_goals"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "conversions_goalId_convertedAt_idx" ON "conversions"("goalId", "convertedAt");

-- CreateIndex
CREATE INDEX "system_settings_tenantId_category_idx" ON "system_settings"("tenantId", "category");

-- CreateIndex
CREATE INDEX "system_settings_category_isActive_idx" ON "system_settings"("category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_tenantId_category_key" ON "system_settings"("tenantId", "category");

-- CreateIndex
CREATE INDEX "configuration_backups_tenantId_createdAt_idx" ON "configuration_backups"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "configuration_backups_createdAt_expiresAt_idx" ON "configuration_backups"("createdAt", "expiresAt");

-- CreateIndex
CREATE INDEX "log_entries_tenantId_level_timestamp_idx" ON "log_entries"("tenantId", "level", "timestamp");

-- CreateIndex
CREATE INDEX "log_entries_tenantId_context_idx" ON "log_entries"("tenantId", "context");

-- CreateIndex
CREATE INDEX "log_entries_timestamp_level_idx" ON "log_entries"("timestamp", "level");

-- CreateIndex
CREATE INDEX "log_entries_sessionId_idx" ON "log_entries"("sessionId");

-- CreateIndex
CREATE INDEX "log_entries_requestId_idx" ON "log_entries"("requestId");

-- CreateIndex
CREATE INDEX "alert_rules_tenantId_enabled_idx" ON "alert_rules"("tenantId", "enabled");

-- CreateIndex
CREATE INDEX "alert_rules_metric_enabled_idx" ON "alert_rules"("metric", "enabled");

-- CreateIndex
CREATE INDEX "alerts_ruleId_status_idx" ON "alerts"("ruleId", "status");

-- CreateIndex
CREATE INDEX "alerts_status_severity_idx" ON "alerts"("status", "severity");

-- CreateIndex
CREATE INDEX "alerts_triggeredAt_idx" ON "alerts"("triggeredAt");

-- CreateIndex
CREATE INDEX "alerts_tenantId_status_idx" ON "alerts"("tenantId", "status");

-- CreateIndex
CREATE INDEX "notification_templates_channel_isDefault_idx" ON "notification_templates"("channel", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_tenantId_name_channel_key" ON "notification_templates"("tenantId", "name", "channel");

-- CreateIndex
CREATE INDEX "maintenance_windows_tenantId_startTime_endTime_idx" ON "maintenance_windows"("tenantId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "maintenance_windows_startTime_endTime_idx" ON "maintenance_windows"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "health_checks_tenantId_enabled_idx" ON "health_checks"("tenantId", "enabled");

-- CreateIndex
CREATE INDEX "health_checks_type_enabled_idx" ON "health_checks"("type", "enabled");

-- CreateIndex
CREATE INDEX "health_check_results_healthCheckId_checkedAt_idx" ON "health_check_results"("healthCheckId", "checkedAt");

-- CreateIndex
CREATE INDEX "health_check_results_status_checkedAt_idx" ON "health_check_results"("status", "checkedAt");

-- CreateIndex
CREATE INDEX "monitoring_events_tenantId_type_timestamp_idx" ON "monitoring_events"("tenantId", "type", "timestamp");

-- CreateIndex
CREATE INDEX "monitoring_events_type_processed_idx" ON "monitoring_events"("type", "processed");

-- CreateIndex
CREATE INDEX "monitoring_events_timestamp_idx" ON "monitoring_events"("timestamp");

-- CreateIndex
CREATE INDEX "tenant_domains_tenantId_isPrimary_idx" ON "tenant_domains"("tenantId", "isPrimary");

-- CreateIndex
CREATE INDEX "tenant_domains_domain_isActive_idx" ON "tenant_domains"("domain", "isActive");

-- CreateIndex
CREATE INDEX "tenant_domains_type_isActive_idx" ON "tenant_domains"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_domains_domain_key" ON "tenant_domains"("domain");

-- CreateIndex
CREATE INDEX "database_backups_tenantId_status_idx" ON "database_backups"("tenantId", "status");

-- CreateIndex
CREATE INDEX "database_backups_status_createdAt_idx" ON "database_backups"("status", "createdAt");

-- CreateIndex
CREATE INDEX "database_backups_expiresAt_idx" ON "database_backups"("expiresAt");

-- CreateIndex
CREATE INDEX "database_backups_backupType_isAutomatic_idx" ON "database_backups"("backupType", "isAutomatic");

-- CreateIndex
CREATE INDEX "system_backups_tenantId_status_idx" ON "system_backups"("tenantId", "status");

-- CreateIndex
CREATE INDEX "system_backups_status_createdAt_idx" ON "system_backups"("status", "createdAt");

-- CreateIndex
CREATE INDEX "system_backups_expiresAt_idx" ON "system_backups"("expiresAt");

-- CreateIndex
CREATE INDEX "system_backups_backupType_isAutomatic_idx" ON "system_backups"("backupType", "isAutomatic");

-- CreateIndex
CREATE INDEX "backup_schedules_tenantId_isEnabled_idx" ON "backup_schedules"("tenantId", "isEnabled");

-- CreateIndex
CREATE INDEX "backup_schedules_isEnabled_nextRunAt_idx" ON "backup_schedules"("isEnabled", "nextRunAt");

-- CreateIndex
CREATE INDEX "backup_schedules_scheduleType_isEnabled_idx" ON "backup_schedules"("scheduleType", "isEnabled");

-- CreateIndex
CREATE INDEX "restore_operations_tenantId_status_idx" ON "restore_operations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "restore_operations_status_createdAt_idx" ON "restore_operations"("status", "createdAt");

-- CreateIndex
CREATE INDEX "restore_operations_backupId_idx" ON "restore_operations"("backupId");

-- CreateIndex
CREATE INDEX "system_updates_tenantId_status_idx" ON "system_updates"("tenantId", "status");

-- CreateIndex
CREATE INDEX "system_updates_status_scheduledAt_idx" ON "system_updates"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "system_updates_updateType_status_idx" ON "system_updates"("updateType", "status");

-- CreateIndex
CREATE INDEX "system_updates_version_idx" ON "system_updates"("version");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_features" ADD CONSTRAINT "tenant_features_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_category_translations" ADD CONSTRAINT "blog_category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_translations" ADD CONSTRAINT "blog_post_translations_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_translations" ADD CONSTRAINT "menu_item_translations_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_setting_translations" ADD CONSTRAINT "site_setting_translations_siteSettingId_fkey" FOREIGN KEY ("siteSettingId") REFERENCES "site_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_translations" ADD CONSTRAINT "team_member_translations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "references" ADD CONSTRAINT "references_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_translations" ADD CONSTRAINT "reference_translations_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_gallery" ADD CONSTRAINT "reference_gallery_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_info" ADD CONSTRAINT "contact_info_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_info_translations" ADD CONSTRAINT "contact_info_translations_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "contact_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "contact_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_links" ADD CONSTRAINT "social_media_links_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_links" ADD CONSTRAINT "social_media_links_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "contact_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_links" ADD CONSTRAINT "social_media_links_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_translations" ADD CONSTRAINT "banner_translations_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonial_translations" ADD CONSTRAINT "testimonial_translations_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "testimonials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sliders" ADD CONSTRAINT "sliders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slider_translations" ADD CONSTRAINT "slider_translations_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "sliders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slider_items" ADD CONSTRAINT "slider_items_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "sliders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slider_item_translations" ADD CONSTRAINT "slider_item_translations_sliderItemId_fkey" FOREIGN KEY ("sliderItemId") REFERENCES "slider_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_positions" ADD CONSTRAINT "banner_positions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_position_assignments" ADD CONSTRAINT "banner_position_assignments_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_position_assignments" ADD CONSTRAINT "banner_position_assignments_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "banner_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_setting_translations" ADD CONSTRAINT "seo_setting_translations_seoSettingId_fkey" FOREIGN KEY ("seoSettingId") REFERENCES "seo_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structured_data" ADD CONSTRAINT "structured_data_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_seo_translations" ADD CONSTRAINT "page_seo_translations_pageSeoId_fkey" FOREIGN KEY ("pageSeoId") REFERENCES "page_seo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sitemap_config" ADD CONSTRAINT "sitemap_config_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_integrations" ADD CONSTRAINT "seo_integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "og_templates" ADD CONSTRAINT "og_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "og_template_translations" ADD CONSTRAINT "og_template_translations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "og_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_translations" ADD CONSTRAINT "gallery_translations_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_analytics" ADD CONSTRAINT "social_media_analytics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_analytics" ADD CONSTRAINT "social_media_analytics_socialLinkId_fkey" FOREIGN KEY ("socialLinkId") REFERENCES "social_media_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_configurations" ADD CONSTRAINT "map_configurations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_categories" ADD CONSTRAINT "location_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_category_translations" ADD CONSTRAINT "location_category_translations_locationCategoryId_fkey" FOREIGN KEY ("locationCategoryId") REFERENCES "location_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_assignments" ADD CONSTRAINT "location_assignments_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_assignments" ADD CONSTRAINT "location_assignments_mapConfigurationId_fkey" FOREIGN KEY ("mapConfigurationId") REFERENCES "map_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_assignments" ADD CONSTRAINT "location_assignments_locationCategoryId_fkey" FOREIGN KEY ("locationCategoryId") REFERENCES "location_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_shares" ADD CONSTRAINT "social_media_shares_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_analytics" ADD CONSTRAINT "website_analytics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_reports" ADD CONSTRAINT "analytics_reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "analytics_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_metrics" ADD CONSTRAINT "system_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_analytics" ADD CONSTRAINT "content_analytics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_goals" ADD CONSTRAINT "conversion_goals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "conversion_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_backups" ADD CONSTRAINT "configuration_backups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "alert_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_checks" ADD CONSTRAINT "health_checks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_check_results" ADD CONSTRAINT "health_check_results_healthCheckId_fkey" FOREIGN KEY ("healthCheckId") REFERENCES "health_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_events" ADD CONSTRAINT "monitoring_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_domains" ADD CONSTRAINT "tenant_domains_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "database_backups" ADD CONSTRAINT "database_backups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_backups" ADD CONSTRAINT "system_backups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_schedules" ADD CONSTRAINT "backup_schedules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restore_operations" ADD CONSTRAINT "restore_operations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restore_operations" ADD CONSTRAINT "restore_operations_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "system_backups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_updates" ADD CONSTRAINT "system_updates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
