import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  NightCanteenItemQueryDto,
  NightCanteenOrderQueryDto,
} from './dto/night-canteen-query.dto';
import { CreateCanteenItemDto } from './dto/create-canteen-item.dto';
import { UpdateCanteenItemDto } from './dto/update-canteen-item.dto';
import { CreateCanteenOrderDto } from './dto/create-canteen-order.dto';
import { UpdateCanteenOrderDto } from './dto/update-canteen-order.dto';

@Injectable()
export class NightCanteenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findItems(query: NightCanteenItemQueryDto) {
    const where: Prisma.CanteenItemWhereInput = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.isAvailable
        ? { isAvailable: query.isAvailable === 'true' }
        : {}),
    };

    const total = await this.prisma.canteenItem.count({ where });
    const items = await this.prisma.canteenItem.findMany({
      where,
      skip: query.offset,
      take: query.limit,
      orderBy: { [query.sortBy ?? 'updatedAt']: query.sortOrder ?? 'desc' },
    });

    return { items, total, limit: query.limit, offset: query.offset };
  }

  findItemById(id: string) {
    return this.prisma.canteenItem.findUnique({ where: { id } });
  }

  createItem(data: CreateCanteenItemDto) {
    return this.prisma.canteenItem.create({
      data: {
        ...data,
        description: data.description ?? '',
        image: data.image ?? '',
        isAvailable: data.isAvailable ?? true,
        stock: data.stock ?? 100,
      },
    });
  }

  upsertItem(id: string, data: CreateCanteenItemDto) {
    return this.prisma.canteenItem.upsert({
      where: { id },
      update: {
        ...data,
        description: data.description ?? '',
        image: data.image ?? '',
        isAvailable: data.isAvailable ?? true,
        stock: data.stock ?? 100,
      },
      create: {
        id,
        ...data,
        description: data.description ?? '',
        image: data.image ?? '',
        isAvailable: data.isAvailable ?? true,
        stock: data.stock ?? 100,
      },
    });
  }

  updateItem(id: string, data: UpdateCanteenItemDto) {
    return this.prisma.canteenItem.update({
      where: { id },
      data,
    });
  }

  deleteItem(id: string) {
    return this.prisma.canteenItem.delete({ where: { id } });
  }

  async findOrders(query: NightCanteenOrderQueryDto) {
    const where: Prisma.CanteenOrderWhereInput = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const total = await this.prisma.canteenOrder.count({ where });
    const orders = await this.prisma.canteenOrder.findMany({
      where,
      skip: query.offset,
      take: query.limit,
      orderBy: { [query.sortBy ?? 'timestamp']: query.sortOrder ?? 'desc' },
    });

    return { items: orders, total, limit: query.limit, offset: query.offset };
  }

  findOrderById(id: string) {
    return this.prisma.canteenOrder.findUnique({ where: { id } });
  }

  createOrder(data: CreateCanteenOrderDto) {
    return this.prisma.canteenOrder.create({
      data: {
        studentId: data.studentId,
        studentName: data.studentName ?? 'Student',
        hostelRoom: data.hostelRoom ?? 'Hostel',
        items: ((data.items ?? []) as unknown) as Prisma.JsonArray,
        totalAmount: data.totalAmount,
        status: data.status ?? 'Pending',
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
    });
  }

  updateOrder(id: string, data: UpdateCanteenOrderDto) {
    return this.prisma.canteenOrder.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.hostelRoom ? { hostelRoom: data.hostelRoom } : {}),
        ...(typeof data.totalAmount === 'number'
          ? { totalAmount: data.totalAmount }
          : {}),
        ...(data.items
          ? { items: (data.items as unknown) as Prisma.JsonArray }
          : {}),
      },
    });
  }

  deleteOrder(id: string) {
    return this.prisma.canteenOrder.delete({ where: { id } });
  }
}
