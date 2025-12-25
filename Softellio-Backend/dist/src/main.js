"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./config/prisma.service");
async function getAllowedOrigins() {
    try {
        const prisma = new prisma_service_1.PrismaService();
        await prisma.$connect();
        const systemSettings = await prisma.systemSettings.findFirst({
            select: {
                security: true
            }
        });
        await prisma.$disconnect();
        let corsOrigins = [];
        if (systemSettings?.security) {
            try {
                const securityConfig = typeof systemSettings.security === 'string'
                    ? JSON.parse(systemSettings.security)
                    : systemSettings.security;
                corsOrigins = securityConfig?.corsOrigins || [];
            }
            catch (error) {
                console.warn('Failed to parse security settings:', error.message);
            }
        }
        const defaultOrigins = [
            'http://localhost:3000',
            'http://localhost:4200',
            'https://platform.softellio.com',
            'http://platform.softellio.com'
        ];
        const allOrigins = [...new Set([...defaultOrigins, ...corsOrigins])];
        console.log('🌐 Allowed CORS origins:', allOrigins);
        return allOrigins;
    }
    catch (error) {
        console.warn('⚠️ Could not load CORS origins from database, using defaults:', error.message);
        return [
            'http://localhost:3000',
            'http://localhost:4200',
            'https://platform.softellio.com',
            'http://platform.softellio.com'
        ];
    }
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = await getAllowedOrigins();
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            if (origin.endsWith('.softellio.com')) {
                return callback(null, true);
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`), false);
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.use(cookieParser());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Multi-Tenant CMS API')
        .setDescription('A comprehensive multi-tenant, multi-language CMS backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    const paths = document.paths;
    Object.keys(paths).forEach(path => {
        Object.keys(paths[path]).forEach(method => {
            if (!paths[path][method].parameters) {
                paths[path][method].parameters = [];
            }
            const hasHeader = paths[path][method].parameters.some((param) => param.name === 'X-Tenant-Host');
            if (!hasHeader) {
                paths[path][method].parameters.push({
                    name: 'X-Tenant-Host',
                    in: 'header',
                    required: false,
                    description: 'Tenant domain for multi-tenant operations (e.g., demo.softellio.com)',
                    schema: {
                        type: 'string',
                        example: 'demo.softellio.com'
                    }
                });
            }
        });
    });
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true
        }
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application running on: http://localhost:${port}`);
    console.log(`📖 Swagger docs available at: http://localhost:${port}/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map