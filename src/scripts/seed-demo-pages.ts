import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Idempotent script to ensure demo.softellio.com has all required pages
 *
 * Creates:
 * - "/" (HOME) page - already exists, skip
 * - "/about" page with hero + cta sections
 * - "/contact" page with hero + services sections
 *
 * Uses the new DynamicPage + PageLayout/PageSection system.
 * Safe to re-run multiple times.
 */
async function seedDemoPages() {
  console.log('🌱 Starting demo pages seed...');

  try {
    // 1. Find demo tenant (should already exist)
    const demoTenant = await prisma.tenant.findUnique({
      where: { domain: 'demo.softellio.com' },
    });

    if (!demoTenant) {
      throw new Error('Demo tenant not found! Run the demo tenant setup first.');
    }

    console.log(`✅ Found tenant: ${demoTenant.name} (${demoTenant.domain})`);

    // 2. Check if HOME page exists (should already exist, don't touch it)
    const homePage = await prisma.dynamicPage.findFirst({
      where: {
        tenantId: demoTenant.id,
        slug: '/',
      },
    });

    if (homePage) {
      console.log('✅ HOME page exists, skipping...');
    } else {
      console.log('⚠️  HOME page missing - this is unexpected!');
    }

    // 3. Create or update ABOUT page
    const aboutPage = await prisma.dynamicPage.upsert({
      where: {
        tenantId_slug_language: {
          tenantId: demoTenant.id,
          slug: '/about',
          language: 'tr',
        },
      },
      create: {
        slug: '/about',
        title: 'Hakkımızda',
        layoutKey: 'ABOUT',
        pageType: 'ABOUT',
        language: 'tr',
        published: true,
        publishedAt: new Date(),
        seo: {
          metaTitle: 'Hakkımızda - Demo Baskı Şirketi',
          metaDescription: 'Demo Baskı Şirketi hakkında bilgi edinin. Profesyonel baskı çözümleri ile hizmet veriyoruz.',
          ogTitle: 'Hakkımızda - Demo Baskı Şirketi',
          ogDescription: 'Demo Baskı Şirketi hakkında bilgi edinin.',
          ogImage: 'https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=Hakkımızda',
        },
        tenant: { connect: { id: demoTenant.id } },
      },
      update: {
        title: 'Hakkımızda',
        published: true,
        publishedAt: new Date(),
      },
    });

    console.log(`✅ About page: ${aboutPage.title} (${aboutPage.slug})`);

    // 4. Create or update CONTACT page
    const contactPage = await prisma.dynamicPage.upsert({
      where: {
        tenantId_slug_language: {
          tenantId: demoTenant.id,
          slug: '/contact',
          language: 'tr',
        },
      },
      create: {
        slug: '/contact',
        title: 'İletişim',
        layoutKey: 'CONTACT',
        pageType: 'CONTACT',
        language: 'tr',
        published: true,
        publishedAt: new Date(),
        seo: {
          metaTitle: 'İletişim - Demo Baskı Şirketi',
          metaDescription: 'Demo Baskı Şirketi ile iletişime geçin. Adres, telefon ve e-posta bilgilerimiz.',
          ogTitle: 'İletişim - Demo Baskı Şirketi',
          ogDescription: 'Bizimle iletişime geçin.',
          ogImage: 'https://via.placeholder.com/1200x630/1E40AF/FFFFFF?text=İletişim',
        },
        tenant: { connect: { id: demoTenant.id } },
      },
      update: {
        title: 'İletişim',
        published: true,
        publishedAt: new Date(),
      },
    });

    console.log(`✅ Contact page: ${contactPage.title} (${contactPage.slug})`);

    // 5. Create ABOUT layout and sections
    const aboutLayout = await prisma.pageLayout.upsert({
      where: {
        tenantId_key_language: {
          tenantId: demoTenant.id,
          key: 'ABOUT',
          language: 'tr',
        },
      },
      create: {
        key: 'ABOUT',
        language: 'tr',
        status: 'published',
        tenant: { connect: { id: demoTenant.id } },
      },
      update: {
        status: 'published',
      },
    });

    // Clear existing about sections and recreate
    await prisma.pageSection.deleteMany({
      where: { layoutId: aboutLayout.id },
    });

    await prisma.pageSection.createMany({
      data: [
        {
          tenantId: demoTenant.id,
          layoutId: aboutLayout.id,
          type: 'hero',
          variant: 'premium',
          order: 1,
          isEnabled: true,
          status: 'published',
          propsJson: {
            title: 'Hakkımızda',
            subtitle: 'Demo Baskı Şirketi',
            description: 'Yılların deneyimi ile profesyonel baskı çözümleri sunuyoruz. Kaliteli hizmet anlayışımız ve modern teknolojimizle müşterilerimizin beklentilerini aşıyoruz.',
            textAlign: 'center',
            backgroundColor: '#1E40AF',
            overlayColor: 'rgba(30, 64, 175, 0.8)',
            backgroundImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          },
        },
        {
          tenantId: demoTenant.id,
          layoutId: aboutLayout.id,
          type: 'cta',
          variant: 'premium',
          order: 2,
          isEnabled: true,
          status: 'published',
          propsJson: {
            title: 'Projeleriniz İçin Bizimle İletişime Geçin',
            description: 'Baskı projelerinizi gerçeğe dönüştürmek için hemen bizimle iletişime geçin. Ücretsiz teklif alın.',
            ctaText: 'İletişime Geç',
            ctaUrl: '/contact',
            features: [
              'Ücretsiz teklif',
              'Hızlı teslimat',
              'Profesyonel kalite',
              'Müşteri memnuniyeti garantisi'
            ],
            backgroundColor: '#059669',
            backgroundType: 'solid',
          },
        },
      ],
    });

    console.log(`✅ About layout created with 2 sections`);

    // 6. Create CONTACT layout and sections
    const contactLayout = await prisma.pageLayout.upsert({
      where: {
        tenantId_key_language: {
          tenantId: demoTenant.id,
          key: 'CONTACT',
          language: 'tr',
        },
      },
      create: {
        key: 'CONTACT',
        language: 'tr',
        status: 'published',
        tenant: { connect: { id: demoTenant.id } },
      },
      update: {
        status: 'published',
      },
    });

    // Clear existing contact sections and recreate
    await prisma.pageSection.deleteMany({
      where: { layoutId: contactLayout.id },
    });

    await prisma.pageSection.createMany({
      data: [
        {
          tenantId: demoTenant.id,
          layoutId: contactLayout.id,
          type: 'hero',
          variant: 'premium',
          order: 1,
          isEnabled: true,
          status: 'published',
          propsJson: {
            title: 'İletişime Geçin',
            subtitle: 'Size Nasıl Yardımcı Olabiliriz?',
            description: 'Baskı projeleriniz için profesyonel destek alın. Ekibimiz size en iyi hizmeti sunmak için burada.',
            textAlign: 'center',
            backgroundColor: '#1E40AF',
            overlayColor: 'rgba(30, 64, 175, 0.8)',
            backgroundImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
          },
        },
        {
          tenantId: demoTenant.id,
          layoutId: contactLayout.id,
          type: 'services',
          variant: 'premium',
          order: 2,
          isEnabled: true,
          status: 'published',
          propsJson: {
            title: 'İletişim Bilgileri',
            subtitle: 'Size ulaşmanın tüm yolları',
            columns: 3,
            showIcons: true,
            showDescriptions: true,
            displayMode: 'static',
            services: [
              {
                icon: '📍',
                title: 'Adres',
                description: 'Demo Mahallesi, Baskı Sokak No:123/4 İstanbul, Türkiye',
                features: ['Merkezi konum', 'Kolay ulaşım']
              },
              {
                icon: '📞',
                title: 'Telefon',
                description: '+90 (212) 123 45 67 +90 (532) 123 45 67',
                features: ['7/24 destek', 'Hızlı yanıt']
              },
              {
                icon: '📧',
                title: 'E-posta',
                description: 'info@demo-baski.com satis@demo-baski.com',
                features: ['Hızlı iletişim', 'Teklif talebi']
              },
            ],
          },
        },
      ],
    });

    console.log(`✅ Contact layout created with 2 sections`);

    console.log('\n🎉 Demo pages seeding completed successfully!');
    console.log('\nCreated pages:');
    console.log('- / (HOME) - already existed');
    console.log('- /about - Hakkımızda page with hero + cta sections');
    console.log('- /contact - İletişim page with hero + services sections');
    console.log('\nAll pages are now accessible via the frontend routing system.');

  } catch (error) {
    console.error('❌ Error seeding demo pages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  seedDemoPages()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default seedDemoPages;