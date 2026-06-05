import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CanteenService {
  constructor(private readonly prisma: PrismaService) {}

  private get prismaAny() {
    return this.prisma as any;
  }

  findAllItems() {
    return this.prismaAny.canteenItem.findMany({
      where: { isAvailable: true },
      orderBy: { category: 'asc' },
    });
  }

  findAllOrders(studentId: string) {
    return this.prismaAny.canteenOrder.findMany({
      where: { studentId },
      include: { items: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  async createOrder(data: any) {
    const { items, ...orderData } = data;
    // @ts-ignore
    return this.prismaAny.canteenOrder.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });
  }
}
