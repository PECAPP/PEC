import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { CanteenService } from './canteen.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
@UseGuards(AuthGuard)
export class CanteenController {
  constructor(private readonly canteenService: CanteenService) {}

  @Get('canteenItems')
  getItems() {
    return this.canteenService.findAllItems();
  }

  @Get('canteenOrders')
  getOrders(@Request() req: any) {
    const userId = req.user.sub;
    return this.canteenService.findAllOrders(userId);
  }

  @Post('canteenOrders')
  createOrder(@Body() data: any, @Request() req: any) {
    const userId = req.user.sub;
    return this.canteenService.createOrder({ ...data, studentId: userId });
  }
}
