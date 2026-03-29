import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampusMapQueryDto } from './dto/campus-map-query.dto';
import { CreateCampusMapRegionDto } from './dto/create-campus-map-region.dto';
import { UpdateCampusMapRegionDto } from './dto/update-campus-map-region.dto';
import { CreateCampusMapRoadDto } from './dto/create-campus-map-road.dto';
import { UpdateCampusMapRoadDto } from './dto/update-campus-map-road.dto';

@Injectable()
export class CampusMapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRegions(query: CampusMapQueryDto) {
    const where: Prisma.CampusMapRegionWhereInput = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.organizationId
        ? {
            organizationId: Array.isArray(query.organizationId)
              ? { in: query.organizationId }
              : query.organizationId,
          }
        : {}),
    };

    const total = await this.prisma.campusMapRegion.count({ where });
    const items = await this.prisma.campusMapRegion.findMany({
      where,
      orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'asc' },
      take: query.limit,
      skip: query.offset,
    });

    return { items, total, limit: query.limit, offset: query.offset };
  }

  findRegionById(id: string) {
    return this.prisma.campusMapRegion.findUnique({ where: { id } });
  }

  createRegion(data: CreateCampusMapRegionDto) {
    return this.prisma.campusMapRegion.create({
      data: {
        ...data,
        description: data.description ?? '',
      },
    });
  }

  updateRegion(id: string, data: UpdateCampusMapRegionDto) {
    return this.prisma.campusMapRegion.update({ where: { id }, data });
  }

  deleteRegion(id: string) {
    return this.prisma.campusMapRegion.delete({ where: { id } });
  }

  async findRoads(query: CampusMapQueryDto) {
    const where: Prisma.CampusMapRoadWhereInput = {
      ...(query.organizationId
        ? {
            organizationId: Array.isArray(query.organizationId)
              ? { in: query.organizationId }
              : query.organizationId,
          }
        : {}),
    };

    const total = await this.prisma.campusMapRoad.count({ where });
    const items = await this.prisma.campusMapRoad.findMany({
      where,
      orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'asc' },
      take: query.limit,
      skip: query.offset,
    });

    return { items, total, limit: query.limit, offset: query.offset };
  }

  findRoadById(id: string) {
    return this.prisma.campusMapRoad.findUnique({ where: { id } });
  }

  createRoad(data: CreateCampusMapRoadDto) {
    return this.prisma.campusMapRoad.create({
      data: {
        points: data.points as Prisma.JsonArray,
        width: data.width,
        organizationId: data.organizationId,
      },
    });
  }

  updateRoad(id: string, data: UpdateCampusMapRoadDto) {
    return this.prisma.campusMapRoad.update({
      where: { id },
      data: {
        ...(data.points ? { points: data.points as Prisma.JsonArray } : {}),
        ...(typeof data.width === 'number' ? { width: data.width } : {}),
        ...(data.organizationId ? { organizationId: data.organizationId } : {}),
      },
    });
  }

  deleteRoad(id: string) {
    return this.prisma.campusMapRoad.delete({ where: { id } });
  }
}
