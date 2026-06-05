import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NightCanteenService } from './night-canteen.service';
import {
  NightCanteenItemQueryDto,
  NightCanteenOrderQueryDto,
} from './dto/night-canteen-query.dto';
import { CreateCanteenItemDto } from './dto/create-canteen-item.dto';
import { UpdateCanteenItemDto } from './dto/update-canteen-item.dto';
import { CreateCanteenOrderDto } from './dto/create-canteen-order.dto';
import { UpdateCanteenOrderDto } from './dto/update-canteen-order.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('night-canteen')
export class NightCanteenController {
  constructor(private readonly service: NightCanteenService) {}

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get('items')
  async listItems(@Query() query: NightCanteenItemQueryDto) {
    const result = await this.service.findItems(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get('items/:id')
  async getItem(@Param('id') id: string) {
    const data = await this.service.findItemById(id);
    return ok(data);
  }

  @Roles('college_admin', 'admin')
  @Post('items')
  async createItem(@Body() body: CreateCanteenItemDto) {
    const data = await this.service.createItem(body);
    return ok(data);
  }

  @Roles('college_admin', 'admin')
  @Post('items/:id')
  async upsertItem(
    @Param('id') id: string,
    @Body() body: CreateCanteenItemDto,
  ) {
    const data = await this.service.upsertItem(id, body);
    return ok(data);
  }

  @Roles('college_admin', 'admin')
  @Patch('items/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() body: UpdateCanteenItemDto,
  ) {
    const data = await this.service.updateItem(id, body);
    return ok(data);
  }

  @Roles('college_admin', 'admin')
  @Delete('items/:id')
  async deleteItem(@Param('id') id: string) {
    const data = await this.service.deleteItem(id);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get('orders')
  async listOrders(
    @Req() req: Request & { user?: { sub?: string; role?: string } },
    @Query() query: NightCanteenOrderQueryDto,
  ) {
    const role = req.user?.role;
    const currentUserId = req.user?.sub;

    const normalizedQuery: NightCanteenOrderQueryDto = {
      ...query,
      studentId: role === 'student' ? currentUserId : query.studentId,
    };

    const result = await this.service.findOrders(normalizedQuery);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    const data = await this.service.findOrderById(id);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Post('orders')
  async createOrder(
    @Req() req: Request & { user?: { sub?: string; role?: string } },
    @Body() body: CreateCanteenOrderDto,
  ) {
    const role = req.user?.role;
    const currentUserId = req.user?.sub;
    const data = await this.service.createOrder({
      ...body,
      studentId: role === 'student' ? currentUserId : body.studentId,
    });
    return ok(data);
  }

  @Roles('college_admin', 'admin')
  @Patch('orders/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() body: UpdateCanteenOrderDto,
  ) {
    const data = await this.service.updateOrder(id, body);
    return ok(data);
  }

  @Roles('college_admin', 'admin')
  @Delete('orders/:id')
  async deleteOrder(@Param('id') id: string) {
    const data = await this.service.deleteOrder(id);
    return ok(data);
  }
}
