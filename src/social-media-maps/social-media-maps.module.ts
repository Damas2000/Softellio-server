import { Module } from '@nestjs/common';
import { SocialMediaMapsService } from './social-media-maps.service';
import { SocialMediaMapsController } from './social-media-maps.controller';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SocialMediaMapsController],
  providers: [SocialMediaMapsService],
  exports: [SocialMediaMapsService],
})
export class SocialMediaMapsModule {}