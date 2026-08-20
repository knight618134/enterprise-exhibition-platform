import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExhibitionDto } from '../dto/create-exhibition.dto';
import { FindExhibitionsQuery } from '../dto/find-exhibitions.query';
import { ExhibitionRepository } from '../repositories/exhibition.repository';
import { UpdateExhibitionDto } from '../dto/update-exhibition.dto';

@Injectable()
export class ExhibitionService {
  constructor(private readonly exhibitionRepository: ExhibitionRepository) {}

  findAll(query: FindExhibitionsQuery) {
    return this.exhibitionRepository.findAll(query);
  }

  async findOne(id: string) {
    const exhibition = await this.exhibitionRepository.findById(id);

    if (!exhibition) {
      throw new NotFoundException(`Exhibition ${id} not found`);
    }

    return exhibition;
  }

  createDraft(dto: CreateExhibitionDto) {
    if (new Date(dto.endAt) <= new Date(dto.startAt)) {
      throw new BadRequestException('endAt must be later than startAt');
    }

    return this.exhibitionRepository.create(dto);
  }

  async update(id: string, dto: UpdateExhibitionDto) {
    const existing = await this.findOne(id);
    const startAt = dto.startAt ?? existing.startAt.toISOString();
    const endAt = dto.endAt ?? existing.endAt.toISOString();

    if (new Date(endAt) <= new Date(startAt)) {
      throw new BadRequestException('endAt must be later than startAt');
    }

    return this.exhibitionRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.startAt !== undefined ? { startAt: new Date(dto.startAt) } : {}),
      ...(dto.endAt !== undefined ? { endAt: new Date(dto.endAt) } : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.exhibitionRepository.delete(id);
    return { id, deleted: true };
  }
}
