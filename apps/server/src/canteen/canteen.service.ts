import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CanteenService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private get prismaAny() {
    return this.prisma as any;
  }

  async findAllItems(skip: number = 0, take: number = 100) {
    const cacheKey = `canteen_items_${skip}_${take}`;
    const cachedItems = await this.cacheManager.get(cacheKey);
    if (cachedItems) {
      return cachedItems;
    }

    const items = await this.prismaAny.canteenItem.findMany({
      skip: Number(skip),
      take: Number(take),
      where: { isAvailable: true },
      orderBy: { category: 'asc' },
    });

    await this.cacheManager.set(cacheKey, items);
    return items;
  }

  async findAllOrders(studentId: string, skip: number = 0, take: number = 50) {
    return this.prismaAny.canteenOrder.findMany({
      skip: Number(skip),
      take: Number(take),
      where: { studentId },
      include: { items: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  async createOrder(data: any) {
    const { items, studentId, studentName, hostelRoom } = data;
    
    return this.prismaAny.$transaction(async (tx: any) => {
      let totalAmount = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const dbItem = await tx.canteenItem.findUnique({
          where: { id: item.itemId }
        });

        if (!dbItem) {
          throw new Error(`Item ${item.itemId} not found`);
        }

        if (dbItem.stock < item.quantity) {
          throw new Error(`Not enough stock for ${dbItem.name}. Available: ${dbItem.stock}`);
        }

        // Decrement stock
        await tx.canteenItem.update({
          where: { id: item.itemId },
          data: { stock: { decrement: item.quantity } }
        });

        const itemTotal = dbItem.price * item.quantity;
        totalAmount += itemTotal;

        orderItemsToCreate.push({
          itemId: dbItem.id,
          name: dbItem.name,
          quantity: item.quantity,
          price: dbItem.price, // Use true price from DB
        });
      }

      return tx.canteenOrder.create({
        data: {
          studentId,
          studentName,
          hostelRoom,
          totalAmount,
          items: {
            create: orderItemsToCreate
          }
        },
        include: { items: true },
      });
    });
  }
}
