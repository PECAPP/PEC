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
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin')
  @Get()
  findMany(@Query() query: RoomQueryDto) {
    return this.service.findMany(query);
  }

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin')
  @Get('availability')
  getAvailability(
    @Query('building') building: string,
    @Query('floor') floor?: number,
  ) {
    return this.service.getAvailability(building, floor ? parseInt(floor as any) : undefined);
  }

  @Roles('faculty', 'admin', 'moderator', 'college_admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('admin', 'college_admin')
  @Post()
  create(@Body() body: CreateRoomDto) {
    return this.service.create(body);
  }

  @Roles('admin', 'college_admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateRoomDto>) {
    return this.service.update(id, body);
  }

  @Roles('admin', 'college_admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
