import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './config/prisma.service';

// Function to get allowed CORS origins from database
async function getAllowedOrigins(): Promise<string[]> {
  try {
    const prisma = new PrismaService();
    await prisma.$connect();

    // Get system settings with CORS origins
    const systemSettings = await prisma.systemSettings.findFirst({
      select: {
        security: true
      }
    });

    await prisma.$disconnect();

    // Extract CORS origins from system settings
    let corsOrigins = [];
    if (systemSettings?.security) {
      try {
        const securityConfig = typeof systemSettings.security === 'string'
          ? JSON.parse(systemSettings.security)
          : systemSettings.security;
        corsOrigins = securityConfig?.corsOrigins || [];
      } catch (error) {
        console.warn('Failed to parse security settings:', error.message);
      }
    }

    // Always include development origins and production domains
    const defaultOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',  // Public site (Next.js)
      'http://localhost:3002',  // Portal CMS (Next.js)
      'http://localhost:3003',  // Dev site
      'http://localhost:4200',
      'https://platform.softellio.com',
      'http://platform.softellio.com',
      'https://portal.softellio.com',
      'https://demo.softellio.com',
      'https://softellio.com'
    ];

    // Combine and deduplicate origins
    const allOrigins = [...new Set([...defaultOrigins, ...corsOrigins])];

    console.log('🌐 Allowed CORS origins:', allOrigins);
    return allOrigins;
  } catch (error) {
    console.warn('⚠️ Could not load CORS origins from database, using defaults:', error.message);
    return [
      'http://localhost:3000',
      'http://localhost:3001',  // Public site (Next.js)
      'http://localhost:3002',  // Portal CMS (Next.js)
      'http://localhost:3003',  // Dev site
      'http://localhost:4200',
      'https://platform.softellio.com',
      'http://platform.softellio.com',
      'https://portal.softellio.com',
      'https://demo.softellio.com',
      'https://softellio.com'
    ];
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get allowed CORS origins from database
  const allowedOrigins = await getAllowedOrigins();

  // Enable CORS with credentials for multi-tenant support
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all softellio.com subdomains
      if (origin.endsWith('.softellio.com')) {
        return callback(null, true);
      }

      // Reject other origins
      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-Id',
      'X-Tenant-Host',
      'Host',
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser for refresh tokens
  app.use(cookieParser());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Multi-Tenant CMS API')
    .setDescription('A comprehensive multi-tenant, multi-language CMS backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Global header ekleme - manuel olarak document'e inject et
  const paths = document.paths;
  Object.keys(paths).forEach(path => {
    Object.keys(paths[path]).forEach(method => {
      if (!paths[path][method].parameters) {
        paths[path][method].parameters = [];
      }

      // X-Tenant-Host header'ı henüz yoksa ekle
      const hasHeader = paths[path][method].parameters.some(
        (param: any) => param.name === 'X-Tenant-Host'
      );

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

  SwaggerModule.setup('api-docs', app, document, {
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