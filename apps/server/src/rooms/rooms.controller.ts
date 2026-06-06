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
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';



import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @CheckPolicies((ability) => ability.can('read', 'Room'))
  @Get()
  findMany(@Query() query: RoomQueryDto) {
    return this.service.findMany(query);
  }

  @CheckPolicies((ability) => ability.can('read', 'Room'))
  @Get('availability')
  getAvailability(
    @Query('building') building: string,
    @Query('floor') floor?: number,
  ) {
    return this.service.getAvailability(building, floor ? parseInt(floor as any) : undefined);
  }

  @CheckPolicies((ability) => ability.can('read', 'Room'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @CheckPolicies((ability) => ability.can('create', 'Room'))
  @Post()
  create(@Body() body: CreateRoomDto) {
    return this.service.create(body);
  }

  @CheckPolicies((ability) => ability.can('update', 'Room'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateRoomDto>) {
    return this.service.update(id, body);
  }

  @CheckPolicies((ability) => ability.can('delete', 'Room'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

