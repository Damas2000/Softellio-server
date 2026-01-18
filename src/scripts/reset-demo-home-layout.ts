import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../config/prisma.service';

/**
 * Idempotent script to reset demo.softellio.com HOME layout with 4 premium sections:
 * 1) hero: premium (order 1)
 * 2) services: premium (order 2)
 * 3) testimonials: premium (order 3)
 * 4) cta: premium (order 4)
 */
async function resetDemoHomeLayout() {
  console.log('🔄 Starting demo HOME layout reset...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);

    // Step 1: Resolve tenant by domain or find Demo Company
    console.log('🔍 Finding demo.softellio.com tenant...');
    let domain = await prisma.tenantDomain.findUnique({
      where: { domain: 'demo.softellio.com' },
      include: { tenant: true }
    });

    let tenant;
    if (!domain) {
      // Try to find Demo Company tenant
      console.log('🔍 Domain not found, looking for Demo Company tenant...');
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { name: { contains: 'Demo' } },
            { id: 1 } // Default demo tenant ID
          ]
        }
      });

      if (!tenant) {
        throw new Error('❌ Demo tenant not found');
      }

      console.log(`✅ Found demo tenant: ${tenant.name} (ID: ${tenant.id})`);

      // Create the demo domain if it doesn't exist
      console.log('📝 Creating demo.softellio.com domain...');
      domain = await prisma.tenantDomain.create({
        data: {
          tenantId: tenant.id,
          domain: 'demo.softellio.com',
          type: 'CUSTOM',
          isPrimary: true,
          isActive: true,
          isVerified: true,
          verifiedAt: new Date()
        },
        include: { tenant: true }
      });
      console.log(`✅ Created domain: ${domain.domain}`);
    } else {
      tenant = domain.tenant;
      console.log(`✅ Found tenant: ${tenant.name} (ID: ${tenant.id})`);
    }

    // Step 2: Find or create HOME layout for Turkish
    console.log('🎯 Finding HOME layout for language: tr...');
    let layout = await prisma.pageLayout.findUnique({
      where: {
        tenantId_key_language: {
          tenantId: tenant.id,
          key: 'HOME',
          language: 'tr'
        }
      },
      include: { sections: true }
    });

    if (!layout) {
      console.log('📄 Creating new HOME layout...');
      layout = await prisma.pageLayout.create({
        data: {
          tenantId: tenant.id,
          key: 'HOME',
          language: 'tr',
          status: 'published'
        },
        include: { sections: true }
      });
    } else {
      console.log(`✅ Found existing HOME layout (ID: ${layout.id}) with ${layout.sections.length} sections`);
    }

    // Step 3: Delete existing sections for this layout
    if (layout.sections.length > 0) {
      console.log('🧹 Removing existing sections...');
      await prisma.pageSection.deleteMany({
        where: { layoutId: layout.id }
      });
      console.log(`✅ Deleted ${layout.sections.length} existing sections`);
    }

    // Step 4: Create 4 new premium sections with realistic content
    console.log('✨ Creating new premium sections...');

    const sectionsData = [
      {
        type: 'hero',
        variant: 'premium',
        order: 1,
        propsJson: {
          title: 'Softellio Demo Sitesi',
          subtitle: 'Profesyonel Web Çözümleri Demo Platformu',
          description: 'Modern web teknolojileri ile hazırlanmış demo site. Responsive tasarım, hızlı performans ve kullanıcı dostu arayüz.',
          buttonText: 'Demo İncele',
          buttonUrl: '/about',
          backgroundImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          backgroundColor: '#1E40AF',
          overlayColor: 'rgba(30, 64, 175, 0.8)',
          textAlign: 'center'
        }
      },
      {
        type: 'services',
        variant: 'premium',
        order: 2,
        propsJson: {
          title: 'Demo Hizmetlerimiz',
          subtitle: 'Kapsamlı web çözümleri ve demo özellikler',
          services: [
            {
              title: 'Web Tasarım Demo',
              description: 'Modern, responsive ve kullanıcı dostu web tasarım örnekleri. Mobil uyumlu ve SEO optimizasyonlu.',
              icon: '🎨',
              features: ['Responsive Tasarım', 'SEO Optimizasyonu', 'Hızlı Yükleme']
            },
            {
              title: 'E-Ticaret Demo',
              description: 'Güçlü e-ticaret çözümleri demo versiyonu. Ödeme sistemleri ve stok yönetimi örnekleri.',
              icon: '🛒',
              features: ['Ürün Yönetimi', 'Ödeme Entegrasyonu', 'Sipariş Takibi']
            },
            {
              title: 'Kurumsal Portal Demo',
              description: 'Kurumsal firmalara özel portal çözümleri. Yönetim paneli ve kullanıcı yetkilendirme demo.',
              icon: '🏢',
              features: ['Yönetim Paneli', 'Kullanıcı Rolleri', 'Raporlama Sistemi']
            },
            {
              title: 'Mobil Uygulama Demo',
              description: 'Cross-platform mobil uygulama geliştirme örnekleri. iOS ve Android uyumlu demo.',
              icon: '📱',
              features: ['iOS Uyumlu', 'Android Uyumlu', 'Push Notification']
            }
          ],
          displayMode: 'static',
          columns: 2,
          showIcons: true,
          showDescriptions: true
        }
      },
      {
        type: 'testimonials',
        variant: 'premium',
        order: 3,
        propsJson: {
          title: 'Demo Müşteri Yorumları',
          subtitle: 'Kullanıcılarımızın demo deneyimleri',
          testimonials: [
            {
              name: 'Ahmet Yılmaz',
              company: 'TeknoTürk A.Ş.',
              text: 'Softellio demo platformu gerçekten etkileyici. Kullanıcı arayüzü çok sezgisel ve özellikler oldukça kapsamlı.',
              rating: 5,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
            },
            {
              name: 'Elif Kaya',
              company: 'Dijital Çözümler Ltd.',
              text: 'Demo sürümde bile bu kadar gelişmiş özellikler görmek bizi gerçekten şaşırttı. Kesinlikle tavsiye ederim.',
              rating: 5,
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
            },
            {
              name: 'Mehmet Demir',
              company: 'Başarı Teknoloji',
              text: 'Platformun demo versiyonu bile ihtiyacımızı karşılıyor. Üretime geçiş sürecimiz çok hızlı oldu.',
              rating: 5,
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80'
            }
          ],
          displayMode: 'static',
          layout: 'carousel',
          autoPlay: true,
          showRatings: true
        }
      },
      {
        type: 'cta',
        variant: 'premium',
        order: 4,
        propsJson: {
          title: 'Demo Deneyimini Başlatın',
          description: 'Softellio platformunun tüm özelliklerini ücretsiz demo hesabınızla keşfedin. Kurulum gerektirmez, hemen başlayabilirsiniz.',
          ctaText: 'Ücretsiz Demo Başlat',
          ctaUrl: '/demo-baslat',
          secondaryCtaText: 'Özellikler',
          secondaryCtaUrl: '/features',
          features: [
            '30 günlük ücretsiz demo',
            'Kredi kartı gerektirmez',
            'Tam özellik erişimi',
            'Teknik destek dahil'
          ],
          backgroundColor: '#059669',
          backgroundType: 'gradient'
        }
      }
    ];

    // Create each section
    for (const sectionData of sectionsData) {
      const section = await prisma.pageSection.create({
        data: {
          tenantId: tenant.id,
          layoutId: layout.id,
          type: sectionData.type,
          variant: sectionData.variant,
          order: sectionData.order,
          isEnabled: true,
          status: 'published',
          propsJson: sectionData.propsJson
        }
      });

      console.log(`✅ Created ${sectionData.type} section (order ${sectionData.order}) - ID: ${section.id}`);
    }

    // Step 5: Ensure layout remains published
    await prisma.pageLayout.update({
      where: { id: layout.id },
      data: {
        status: 'published',
        updatedAt: new Date()
      }
    });

    console.log('🎉 Demo HOME layout reset completed successfully!');
    console.log('');
    console.log('📊 Layout Summary:');
    console.log(`   Tenant: ${tenant.name} (${domain.domain})`);
    console.log(`   Layout: HOME (tr) - ID: ${layout.id}`);
    console.log(`   Sections: 4 premium sections created`);
    console.log('   1) hero: premium (order 1)');
    console.log('   2) services: premium (order 2)');
    console.log('   3) testimonials: premium (order 3)');
    console.log('   4) cta: premium (order 4)');
    console.log('');
    console.log('🔗 Test with:');
    console.log(`   curl -s "http://localhost:3000/public/site/pages/by-slug/%2F?lang=tr" -H "X-Tenant-Host: demo.softellio.com"`);

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the script
if (require.main === module) {
  resetDemoHomeLayout().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { resetDemoHomeLayout };