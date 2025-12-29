import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { FrontendModule } from '../frontend/frontend.module';

@Module({
  imports: [FrontendModule],
  controllers: [CmsController],
})
export class CmsModule {}