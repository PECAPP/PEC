import { Module } from '@nestjs/common';
import {
  CampusMapController,
  CampusMapRoadsController,
} from './campus-map.controller';
import { CampusMapService } from './campus-map.service';
import { CampusMapRepository } from './campus-map.repository';

@Module({
  controllers: [CampusMapController, CampusMapRoadsController],
  providers: [CampusMapService, CampusMapRepository],
})
export class CampusMapModule {}
