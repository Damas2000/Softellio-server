import { Module } from '@nestjs/common';
import { FrontendController } from './frontend.controller';
import { FrontendBootstrapService } from './frontend-bootstrap.service';
import { FrontendDebugController } from './frontend-debug.controller';
import { ThemeSettingsController } from './theme-settings.controller';
import { PageLayoutsController } from './page-layouts.controller';
import { FrontendAggregatorController } from './frontend-aggregator.controller';
import { SectionTypesController } from './section-types.controller';
import { ThemeSettingsService } from './theme-settings.service';
import { PageLayoutsService } from './page-layouts.service';
import { FrontendAggregatorService } from './frontend-aggregator.service';
import { SectionTypesService } from './section-types.service';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [
    FrontendController,
    FrontendDebugController,
    ThemeSettingsController,
    PageLayoutsController,
    FrontendAggregatorController,
    SectionTypesController,
  ],
  providers: [
    FrontendBootstrapService,
    ThemeSettingsService,
    PageLayoutsService,
    FrontendAggregatorService,
    SectionTypesService,
  ],
  exports: [
    FrontendBootstrapService,
    ThemeSettingsService,
    PageLayoutsService,
    FrontendAggregatorService,
    SectionTypesService,
  ],
})
export class FrontendModule {}