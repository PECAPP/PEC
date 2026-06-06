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



import { ok } from '../common/utils/api-response';
import { CampusMapService } from './campus-map.service';
import { CampusMapQueryDto } from './dto/campus-map-query.dto';
import { CreateCampusMapRegionDto } from './dto/create-campus-map-region.dto';
import { UpdateCampusMapRegionDto } from './dto/update-campus-map-region.dto';
import { CreateCampusMapRoadDto } from './dto/create-campus-map-road.dto';
import { UpdateCampusMapRoadDto } from './dto/update-campus-map-road.dto';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('campusMapRegions')
export class CampusMapController {
  constructor(private readonly service: CampusMapService) {}

  @CheckPolicies((ability) => ability.can('read', 'CampusMap'))
  @Get()
  async listRegions(@Query() query: CampusMapQueryDto) {
    const result = await this.service.findRegions(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('read', 'CampusMap'))
  @Get(':id')
  async getRegion(@Param('id') id: string) {
    const data = await this.service.findRegionById(id);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'CampusMap'))
  @Post()
  async createRegion(@Body() body: CreateCampusMapRegionDto) {
    const data = await this.service.createRegion(body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'CampusMap'))
  @Patch(':id')
  async updateRegion(
    @Param('id') id: string,
    @Body() body: UpdateCampusMapRegionDto,
  ) {
    const data = await this.service.updateRegion(id, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'CampusMap'))
  @Delete(':id')
  async deleteRegion(@Param('id') id: string) {
    const data = await this.service.deleteRegion(id);
    return ok(data);
  }
}

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('campusMapRoads')
export class CampusMapRoadsController {
  constructor(private readonly service: CampusMapService) {}

  @CheckPolicies((ability) => ability.can('read', 'CampusMap'))
  @Get()
  async listRoads(@Query() query: CampusMapQueryDto) {
    const result = await this.service.findRoads(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('read', 'CampusMap'))
  @Get(':id')
  async getRoad(@Param('id') id: string) {
    const data = await this.service.findRoadById(id);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'CampusMap'))
  @Post()
  async createRoad(@Body() body: CreateCampusMapRoadDto) {
    const data = await this.service.createRoad(body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'CampusMap'))
  @Patch(':id')
  async updateRoad(
    @Param('id') id: string,
    @Body() body: UpdateCampusMapRoadDto,
  ) {
    const data = await this.service.updateRoad(id, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'CampusMap'))
  @Delete(':id')
  async deleteRoad(@Param('id') id: string) {
    const data = await this.service.deleteRoad(id);
    return ok(data);
  }
}

