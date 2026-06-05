import { Injectable } from '@nestjs/common';
import { CampusMapRepository } from './campus-map.repository';
import { CampusMapQueryDto } from './dto/campus-map-query.dto';
import { CreateCampusMapRegionDto } from './dto/create-campus-map-region.dto';
import { UpdateCampusMapRegionDto } from './dto/update-campus-map-region.dto';
import { CreateCampusMapRoadDto } from './dto/create-campus-map-road.dto';
import { UpdateCampusMapRoadDto } from './dto/update-campus-map-road.dto';

@Injectable()
export class CampusMapService {
  constructor(private readonly repo: CampusMapRepository) {}

  findRegions(query: CampusMapQueryDto) {
    return this.repo.findRegions(query);
  }

  findRegionById(id: string) {
    return this.repo.findRegionById(id);
  }

  createRegion(data: CreateCampusMapRegionDto) {
    return this.repo.createRegion(data);
  }

  updateRegion(id: string, data: UpdateCampusMapRegionDto) {
    return this.repo.updateRegion(id, data);
  }

  deleteRegion(id: string) {
    return this.repo.deleteRegion(id);
  }

  findRoads(query: CampusMapQueryDto) {
    return this.repo.findRoads(query);
  }

  findRoadById(id: string) {
    return this.repo.findRoadById(id);
  }

  createRoad(data: CreateCampusMapRoadDto) {
    return this.repo.createRoad(data);
  }

  updateRoad(id: string, data: UpdateCampusMapRoadDto) {
    return this.repo.updateRoad(id, data);
  }

  deleteRoad(id: string) {
    return this.repo.deleteRoad(id);
  }
}
