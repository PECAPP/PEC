import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';



import { CourseMaterialsService } from './course-materials.service';
import { CourseMaterialQueryDto } from './dto/course-material-query.dto';
import { CreateCourseMaterialDto } from './dto/create-course-material.dto';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('course-materials')
export class CourseMaterialsController {
  constructor(private readonly service: CourseMaterialsService) {}

  @CheckPolicies((ability) => ability.can('read', 'CourseMaterial'))
  @Get()
  findMany(@Query() query: CourseMaterialQueryDto) {
    return this.service.findMany(query);
  }

  @CheckPolicies((ability) => ability.can('create', 'CourseMaterial'))
  @Post()
  create(@Body() body: CreateCourseMaterialDto) {
    return this.service.create(body);
  }

  @CheckPolicies((ability) => ability.can('delete', 'CourseMaterial'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

