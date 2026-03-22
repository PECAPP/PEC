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
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ok } from '../common/utils/api-response';
import { FeeRecordsService } from './fee-records.service';
import { FeeRecordQueryDto } from './dto/fee-record-query.dto';
import { CreateFeeRecordDto } from './dto/create-fee-record.dto';
import { UpdateFeeRecordDto } from './dto/update-fee-record.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('fee-records')
export class FeeRecordsController {
  constructor(private readonly feeRecordsService: FeeRecordsService) {}

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Post()
  async create(@Body() body: CreateFeeRecordDto) {
    const data = await this.feeRecordsService.create(body);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator')
  @Get()
  async findAll(@Request() req: any, @Query() query: FeeRecordQueryDto) {
    const result = await this.feeRecordsService.findAll(query, {
      userId: req.user?.sub,
      role: req.user?.role,
    });

    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator')
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.feeRecordsService.findOne(id, {
      userId: req.user?.sub,
      role: req.user?.role,
    });
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator')
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateFeeRecordDto,
  ) {
    const data = await this.feeRecordsService.update(id, body, {
      userId: req.user?.sub,
      role: req.user?.role,
    });
    return ok(data);
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.feeRecordsService.remove(id);
    return ok(data);
  }
}
