import { Injectable, Logger } from '@nestjs/common';
import { TemplatesService } from '../templates.service';
import { CreateTemplateDto } from '../dto/template.dto';

@Injectable()
export class TemplateSeederService {
  private readonly logger = new Logger(TemplateSeederService.name);

  constructor(private templatesService: TemplatesService) {}

  /**
   * Seed the database with default templates
   */
  async seed(): Promise<void> {
    this.logger.log('🌱 Seeding templates...');

    try {
      await this.seedPrintingPremiumTemplate();
      await this.seedBusinessProfessionalTemplate();

      this.logger.log('✅ Template seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Template seeding failed:', error.message);
      throw error;
    }
  }

  /**
   * Seed the printing premium template
   */
  private async seedPrintingPremiumTemplate(): Promise<void> {
    const templateKey = 'printing-premium-v1';

    // Check if template already exists
    try {
      await this.templatesService.findByKey(templateKey);
      this.logger.log(`Template ${templateKey} already exists, skipping...`);
      return;
    } catch (error) {
      // Template doesn't exist, create it
    }

    const templateDto: CreateTemplateDto = {
      key: templateKey,
      name: 'Premium Printing Template',
      description: 'Professional template designed for printing companies with hero, services, testimonials, and contact sections.',
      version: '1.0.0',
      previewImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
      supportedSections: [
        'hero',
        'services',
        'testimonials',
        'contact',
        'gallery',
        'stats',
        'cta'
      ],
      defaultLayout: {
        sections: [
          {
            type: 'hero',
            variant: 'default',
            order: 1,
            enabled: true,
            propsJson: {
              title: 'Branda • Afiş • Tabela',
              subtitle: 'Hızlı üretim, kaliteli baskı, profesyonel montaj.',
              ctaText: 'Teklif Al',
              ctaUrl: '/contact',
              backgroundImage: null
            }
          },
          {
            type: 'services',
            variant: 'grid',
            order: 2,
            enabled: true,
            propsJson: {
              title: 'Hizmetlerimiz',
              subtitle: 'Profesyonel baskı ve reklam çözümleri',
              services: [
                {
                  name: 'Branda Baskı',
                  description: 'Dış mekan dayanımlı branda, mesh, vinil baskı hizmetleri.',
                  icon: 'printer',
                  features: ['Su geçirmez', 'UV dayanımlı', 'Yüksek çözünürlük']
                },
                {
                  name: 'Afiş & Poster',
                  description: 'Yüksek kaliteli afiş ve poster baskı hizmetleri.',
                  icon: 'image',
                  features: ['Canlı renkler', 'Hızlı teslimat', 'Özel boyutlar']
                },
                {
                  name: 'Tabela',
                  description: 'Işıklı ve ışıksız tabela, kutu harf, yönlendirme sistemleri.',
                  icon: 'sign',
                  features: ['LED aydınlatma', 'Weatherproof', 'Kurulum dahil']
                },
                {
                  name: 'Araç Giydirme',
                  description: 'Kurumsal araç kaplama ve folyo uygulama hizmetleri.',
                  icon: 'car',
                  features: ['3M malzeme', 'Profesyonel uygulama', 'Garanti']
                }
              ]
            }
          },
          {
            type: 'testimonials',
            variant: 'default',
            order: 3,
            enabled: true,
            propsJson: {
              title: 'Müşteri Yorumları',
              subtitle: 'Bizimle çalışan müşterilerimizin deneyimleri',
              testimonials: [
                {
                  name: 'Ahmet Yılmaz',
                  company: 'Yılmaz İnşaat',
                  content: 'Kaliteli işçilik ve zamanında teslimat. Kesinlikle tavsiye ederim.',
                  rating: 5,
                  image: null
                },
                {
                  name: 'Elif Kaya',
                  company: 'Kaya Restoran',
                  content: 'Restoran tabelamız çok güzel oldu. Profesyonel ekip, mükemmel sonuç.',
                  rating: 5,
                  image: null
                }
              ]
            }
          },
          {
            type: 'contact',
            variant: 'default',
            order: 4,
            enabled: true,
            propsJson: {
              title: 'İletişim',
              subtitle: 'Projeleriniz için hemen iletişime geçin',
              phone: '+90 212 555 0123',
              email: 'info@example.com',
              address: 'Örnek Mah. Örnek Cad. No:1, İstanbul',
              workingHours: 'Pazartesi-Cumartesi: 08:00-18:00',
              mapUrl: 'https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3011.665...',
              showContactForm: true,
              formFields: [
                { name: 'name', label: 'Ad Soyad', type: 'text', required: true },
                { name: 'email', label: 'E-posta', type: 'email', required: true },
                { name: 'phone', label: 'Telefon', type: 'tel', required: false },
                { name: 'subject', label: 'Konu', type: 'select', options: ['Branda', 'Tabela', 'Afiş', 'Araç Giydirme', 'Diğer'], required: true },
                { name: 'message', label: 'Mesaj', type: 'textarea', required: true }
              ]
            }
          }
        ]
      },
      isActive: true
    };

    await this.templatesService.create(templateDto);
    this.logger.log(`✅ Created template: ${templateKey}`);
  }

  /**
   * Seed a general business template
   */
  private async seedBusinessProfessionalTemplate(): Promise<void> {
    const templateKey = 'business-professional-v1';

    // Check if template already exists
    try {
      await this.templatesService.findByKey(templateKey);
      this.logger.log(`Template ${templateKey} already exists, skipping...`);
      return;
    } catch (error) {
      // Template doesn't exist, create it
    }

    const templateDto: CreateTemplateDto = {
      key: templateKey,
      name: 'Business Professional Template',
      description: 'Clean and professional template suitable for any business with modern sections and layouts.',
      version: '1.0.0',
      previewImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      supportedSections: [
        'hero',
        'services',
        'stats',
        'testimonials',
        'gallery',
        'cta',
        'contact'
      ],
      defaultLayout: {
        sections: [
          {
            type: 'hero',
            variant: 'default',
            order: 1,
            enabled: true,
            propsJson: {
              title: 'Your Business Success',
              subtitle: 'Professional solutions for modern businesses.',
              ctaText: 'Get Started',
              ctaUrl: '/contact',
              backgroundImage: null
            }
          },
          {
            type: 'services',
            variant: 'grid',
            order: 2,
            enabled: true,
            propsJson: {
              title: 'Our Services',
              subtitle: 'Comprehensive solutions for your business needs',
              services: [
                {
                  name: 'Consulting',
                  description: 'Strategic business consulting and planning services.',
                  icon: 'lightbulb',
                  features: ['Strategic Planning', 'Market Analysis', 'Growth Strategy']
                },
                {
                  name: 'Implementation',
                  description: 'Turn your plans into reality with our implementation expertise.',
                  icon: 'cog',
                  features: ['Project Management', 'Quality Assurance', 'Timeline Delivery']
                },
                {
                  name: 'Support',
                  description: 'Ongoing support and maintenance for sustainable success.',
                  icon: 'support',
                  features: ['24/7 Support', 'Regular Updates', 'Training']
                }
              ]
            }
          },
          {
            type: 'stats',
            variant: 'default',
            order: 3,
            enabled: true,
            propsJson: {
              title: 'Our Impact',
              subtitle: 'Numbers that speak for themselves',
              stats: [
                { number: '500+', label: 'Happy Clients' },
                { number: '1000+', label: 'Projects Completed' },
                { number: '50+', label: 'Team Members' },
                { number: '15+', label: 'Years Experience' }
              ]
            }
          },
          {
            type: 'contact',
            variant: 'default',
            order: 4,
            enabled: true,
            propsJson: {
              title: 'Get In Touch',
              subtitle: 'Ready to start your project? Contact us today.',
              phone: '+1 (555) 123-4567',
              email: 'hello@example.com',
              address: '123 Business St, Suite 100, City, State 12345',
              workingHours: 'Monday-Friday: 9:00 AM - 6:00 PM',
              showContactForm: true,
              formFields: [
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'company', label: 'Company', type: 'text', required: false },
                { name: 'subject', label: 'Subject', type: 'select', options: ['General Inquiry', 'Consulting', 'Support', 'Partnership'], required: true },
                { name: 'message', label: 'Message', type: 'textarea', required: true }
              ]
            }
          }
        ]
      },
      isActive: true
    };

    await this.templatesService.create(templateDto);
    this.logger.log(`✅ Created template: ${templateKey}`);
  }
}