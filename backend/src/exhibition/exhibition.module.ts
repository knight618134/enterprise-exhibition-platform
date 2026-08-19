import { Module } from '@nestjs/common';
import { ExhibitionController } from './controllers/exhibition.controller';
import { ExhibitionRepository } from './repositories/exhibition.repository';
import { ExhibitionService } from './services/exhibition.service';

@Module({
  controllers: [ExhibitionController],
  providers: [ExhibitionService, ExhibitionRepository],
})
export class ExhibitionModule {}
