import { Module } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { ContactInfoController } from './contact-info.controller';

@Module({
  controllers: [ContactInfoController],
  providers: [ContactInfoService],
  exports: [ContactInfoService],
})
export class ContactInfoModule {}