import { Module } from '@nestjs/common';
import { BannersSlidersService } from './banners-sliders.service';
import { BannersSlidersController } from './banners-sliders.controller';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BannersSlidersController],
  providers: [BannersSlidersService],
  exports: [BannersSlidersService],
})
export class BannersSlidersModule {}