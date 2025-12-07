import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';
import { PrismaService } from '../config/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      useFactory: async () => {
        // Ensure uploads/temp directory exists
        const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        return {
          dest: uploadDir,
        };
      },
    }),
  ],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, PrismaService],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}