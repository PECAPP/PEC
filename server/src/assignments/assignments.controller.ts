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
import { AssignmentsService } from './assignments.service';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Roles('faculty', 'college_admin')
  @Post()
  async create(@Body() createAssignmentDto: CreateAssignmentDto) {
    const data = await this.assignmentsService.create(createAssignmentDto);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get()
  async findAll(@Query() query: AssignmentQueryDto) {
    const result = await this.assignmentsService.findAll(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.assignmentsService.findOne(id);
    return ok(data);
  }

  @Roles('faculty', 'college_admin')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    const data = await this.assignmentsService.update(id, updateAssignmentDto);
    return ok(data);
  }

  @Roles('faculty', 'college_admin')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.assignmentsService.remove(id);
    return ok(data);
  }
}
