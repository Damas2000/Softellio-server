import { Module } from '@nestjs/common';
import { FrontendController } from './frontend.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [FrontendController],
})
export class FrontendModule {}