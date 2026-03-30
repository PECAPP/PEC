import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ok } from '../common/utils/api-response';
import { NoticeboardService } from './noticeboard.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { ListNoticesDto } from './dto/list-notices.dto';
import { TogglePinDto } from './dto/toggle-pin.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('noticeboard')
export class NoticeboardController {
  constructor(private readonly service: NoticeboardService) {}

  @Roles('college_admin', 'faculty', 'student')
  @Get()
  async list(@Query() query: ListNoticesDto) {
    const result = await this.service.list(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('college_admin')
  @Post()
  async create(@Body() body: CreateNoticeDto, @Request() req: any) {
    const data = await this.service.create(body, req.user?.sub);
    return ok(data);
  }

  @Roles('college_admin')
  @Patch(':id/pin')
  async togglePin(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: TogglePinDto,
  ) {
    const data = await this.service.togglePin(id, body.pinned);
    return ok(data);
  }

  @Roles('college_admin')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.service.remove(id);
    return ok(data);
  }
}
