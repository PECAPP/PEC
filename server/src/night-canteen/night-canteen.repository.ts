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
        name: data.name,
        price: data.price,
        category: data.category,
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
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description ?? '',
        image: data.image ?? '',
        isAvailable: data.isAvailable ?? true,
        stock: data.stock ?? 100,
      },
      create: {
        id,
        name: data.name,
        price: data.price,
        category: data.category,
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
      data: data as any,
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
      include: { items: true },
      orderBy: { [query.sortBy ?? 'timestamp']: query.sortOrder ?? 'desc' },
    });

    return { items: orders, total, limit: query.limit, offset: query.offset };
  }

  findOrderById(id: string) {
    return this.prisma.canteenOrder.findUnique({ 
      where: { id },
      include: { items: true }
    });
  }

  createOrder(data: CreateCanteenOrderDto) {
    if (!data.studentId) {
      throw new Error('studentId is required to create a canteen order');
    }
    if (!data.items?.length) {
      throw new Error('items are required to create a canteen order');
    }
    return (this.prisma.canteenOrder as any).create({
      data: {
        studentId: data.studentId,
        studentName: data.studentName ?? 'Student',
        hostelRoom: data.hostelRoom ?? 'Hostel',
        totalAmount: data.totalAmount,
        status: data.status ?? 'Pending',
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        items: {
          create: (data.items ?? []).map((item: any) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      } as any,
      include: { items: true },
    });
  }

  updateOrder(id: string, data: UpdateCanteenOrderDto) {
    return (this.prisma.canteenOrder as any).update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.hostelRoom ? { hostelRoom: data.hostelRoom } : {}),
        ...(typeof data.totalAmount === 'number'
          ? { totalAmount: data.totalAmount }
          : {}),
        ...(data.items
          ? {
              items: {
                deleteMany: {},
                create: data.items.map((item) => {
                  if (!item.itemId) {
                    throw new Error(
                      'itemId is required for each canteen order item',
                    );
                  }
                  return {
                    itemId: item.itemId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                  };
                }),
              },
            }
          : {}),
      } as any,
      include: { items: true },
    });
  }

  deleteOrder(id: string) {
    return this.prisma.canteenOrder.delete({ where: { id } });
  }
}
