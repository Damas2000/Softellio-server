import { Module } from '@nestjs/common';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
  exports: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}