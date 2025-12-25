import { Module } from "@nestjs/common";
import { ReferencesService } from "./references.service";
import { ReferencesController } from "./references.controller";

@Module({
  controllers: [ReferencesController],
  providers: [ReferencesService],
  exports: [ReferencesService],
})
export class ReferencesModule {}
