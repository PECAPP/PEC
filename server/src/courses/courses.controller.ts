import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles('faculty', 'college_admin', 'admin')
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    const data = await this.coursesService.create(createCourseDto);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get()
  async findAll(@Query() query: CourseQueryDto) {
    const result = await this.coursesService.findAll(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.coursesService.findOne(id);
    return ok(data);
  }

  @Roles('faculty', 'college_admin', 'admin')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const data = await this.coursesService.update(id, updateCourseDto);
    return ok(data);
  }

  @Roles('faculty', 'college_admin', 'admin')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.coursesService.remove(id);
    return ok(data);
  }
}
