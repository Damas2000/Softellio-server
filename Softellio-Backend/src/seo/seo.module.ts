import { Module } from '@nestjs/common';
import { SEOService } from './seo.service';
import { SEOController } from './seo.controller';

@Module({
  controllers: [SEOController],
  providers: [SEOService],
  exports: [SEOService],
})
export class SEOModule {}