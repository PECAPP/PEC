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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CourseMaterialsService } from './course-materials.service';
import { CourseMaterialQueryDto } from './dto/course-material-query.dto';
import { CreateCourseMaterialDto } from './dto/create-course-material.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('course-materials')
export class CourseMaterialsController {
  constructor(private readonly service: CourseMaterialsService) {}

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin', 'super_admin')
  @Get()
  findMany(@Query() query: CourseMaterialQueryDto) {
    return this.service.findMany(query);
  }

  @Roles('faculty', 'admin', 'moderator', 'college_admin', 'super_admin')
  @Post()
  create(@Body() body: CreateCourseMaterialDto) {
    return this.service.create(body);
  }

  @Roles('faculty', 'admin', 'moderator', 'college_admin', 'super_admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
