import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { departmentSchema } from '@pec/shared';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';




@UseGuards(AuthGuard, PoliciesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @CheckPolicies((ability) => ability.can('read', 'Department'))
  @Get()
  async findAll(@Query() query: DepartmentQueryDto) {
    const result = await this.departmentsService.findMany(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('read', 'Department'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.departmentsService.findOne(id);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'Department'))
  @Post()
  async create(
    @Body(new ZodValidationPipe(departmentSchema))
    body: CreateDepartmentDto,
  ) {
    const data = await this.departmentsService.create(body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'Department'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(departmentSchema.partial()))
    body: UpdateDepartmentDto,
  ) {
    const data = await this.departmentsService.update(id, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'Department'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.departmentsService.remove(id);
    return ok(data);
  }
}

