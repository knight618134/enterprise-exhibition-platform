import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateExhibitionDto } from '../dto/create-exhibition.dto';
import { FindExhibitionsQuery } from '../dto/find-exhibitions.query';
import { ExhibitionService } from '../services/exhibition.service';
import { UpdateExhibitionDto } from '../dto/update-exhibition.dto';

@Controller('api/exhibitions')
export class ExhibitionController {
  //物件建立時的入口
  constructor(private readonly exhibitionService: ExhibitionService) {}

  @Get()
  findAll(@Query() query: FindExhibitionsQuery) {
    return this.exhibitionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.exhibitionService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExhibitionDto) {
    return this.exhibitionService.createDraft(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateExhibitionDto,
  ) {
    return this.exhibitionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.exhibitionService.remove(id);
  }
}
