import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomQueryDto } from './dto/room-query.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: RoomQueryDto) {
    const where: any = {};
    if (query.building) where.building = query.building;
    if (query.type) where.type = query.type;
    if (query.floor !== undefined) where.floor = query.floor;
    if (query.isAvailable !== undefined) where.isAvailable = query.isAvailable;

    return this.prisma.room.findMany({
      where,
      orderBy: { building: 'asc' },
      take: query.limit,
      skip: query.offset,
    });
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({ where: { id } });
  }

  async create(data: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        ...data,
        facilities: data.facilities ?? '[]',
        isAvailable: data.isAvailable ?? true,
      },
    });
  }

  async update(id: string, data: Partial<CreateRoomDto>) {
    return this.prisma.room.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.room.delete({ where: { id } });
  }

  async getAvailability(building: string, floor?: number) {
    const where: any = { building, isAvailable: true };
    if (floor !== undefined) where.floor = floor;

    return this.prisma.room.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }
}
