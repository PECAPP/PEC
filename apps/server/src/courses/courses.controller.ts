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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { courseSchema } from '@pec/shared';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';




@UseGuards(AuthGuard, PoliciesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @CheckPolicies((ability) => ability.can('create', 'Course'))
  @Post()
  async create(
    @Body(new ZodValidationPipe(courseSchema))
    createCourseDto: CreateCourseDto,
  ) {
    const data = await this.coursesService.create(createCourseDto);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('read', 'Course'))
  @Get()
  async findAll(@Query() query: CourseQueryDto) {
    const result = await this.coursesService.findAll(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('read', 'Course'))
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.coursesService.findOne(id);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'Course'))
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(courseSchema.partial()))
    updateCourseDto: UpdateCourseDto,
  ) {
    const data = await this.coursesService.update(id, updateCourseDto);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'Course'))
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.coursesService.remove(id);
    return ok(data);
  }
}

