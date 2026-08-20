import { ExhibitionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum ExhibitionSortBy {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  START_AT = 'startAt',
  END_AT = 'endAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindExhibitionsQuery {
  @IsOptional()
  @IsEnum(ExhibitionStatus)
  status?: ExhibitionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @IsOptional()
  @IsEnum(ExhibitionSortBy)
  sortBy = ExhibitionSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder = SortOrder.DESC;
}
