"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seeding_service_1 = require("./seeding.service");
const prisma_service_1 = require("../config/prisma.service");
async function bootstrap() {
    console.log('🚀 Starting database seeding process...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const seedingService = app.get(seeding_service_1.SeedingService);
        const prismaService = app.get(prisma_service_1.PrismaService);
        const shouldClear = process.argv.includes('--clear');
        if (shouldClear) {
            console.log('🧹 Clearing database first...');
            await seedingService.clearDatabase();
        }
        console.log('📊 Ensuring database is up to date...');
        await seedingService.seedAll();
        console.log('✨ Database seeding completed successfully!');
        console.log('');
        console.log('🔑 Default credentials:');
        console.log('   Super Admin: admin@softellio.com / SuperAdmin123!');
        console.log('   Tenant Admin: admin@demo.softellio.com / TenantAdmin123!');
        console.log('');
        console.log('🏢 Demo tenant: demo.softellio.com');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed.js.map