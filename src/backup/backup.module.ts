import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../config/prisma.module';
import { BackupController } from './controllers/backup.controller';
import { BackupService } from './services/backup.service';
import { BackupSchedulerService } from './services/backup-scheduler.service';
import { SystemUpdateService } from './services/system-update.service';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(), // For cron job scheduling
  ],
  controllers: [
    BackupController,
  ],
  providers: [
    BackupService,
    BackupSchedulerService,
    SystemUpdateService,
  ],
  exports: [
    BackupService,
    BackupSchedulerService,
    SystemUpdateService,
  ],
})
export class BackupModule {}