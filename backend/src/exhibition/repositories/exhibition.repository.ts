import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateExhibitionDto } from '../dto/create-exhibition.dto';
import { FindExhibitionsQuery } from '../dto/find-exhibitions.query';

@Injectable()
export class ExhibitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.exhibition.findUnique({ where: { id } });
  }

  findAll(query: FindExhibitionsQuery) {
    const where: Prisma.ExhibitionWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword, mode: 'insensitive' } },
              {
                description: {
                  contains: query.keyword,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const orderBy: Prisma.ExhibitionOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    return Promise.all([
      this.prisma.exhibition.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
      }),
      this.prisma.exhibition.count({ where }),
    ]).then(([items, total]) => ({
      items,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    }));
  }

  create(dto: CreateExhibitionDto) {
    return this.prisma.exhibition.create({
      data: {
        name: dto.name,
        description: dto.description,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
      },
    });
  }

  update(id: string, data: Prisma.ExhibitionUpdateInput) {
    return this.prisma.exhibition.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.exhibition.delete({ where: { id } });
  }
}
