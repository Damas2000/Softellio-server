import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedingService } from './seeding.service';
import { PrismaService } from '../config/prisma.service';

async function bootstrap() {
  console.log('🚀 Starting database seeding process...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedingService = app.get(SeedingService);
    const prismaService = app.get(PrismaService);

    // Check if we should clear the database first
    const shouldClear = process.argv.includes('--clear');

    if (shouldClear) {
      console.log('🧹 Clearing database first...');
      await seedingService.clearDatabase();
    }

    // Run database migration first (if needed)
    console.log('📊 Ensuring database is up to date...');

    // Seed the database
    await seedingService.seedAll();

    console.log('✨ Database seeding completed successfully!');
    console.log('');
    console.log('🔑 Default credentials:');
    console.log('   Super Admin: admin@softellio.com / SuperAdmin123!');
    console.log('   Tenant Admin: admin@demo.softellio.com / TenantAdmin123!');
    console.log('');
    console.log('🏢 Demo tenant: demo.softellio.com');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();