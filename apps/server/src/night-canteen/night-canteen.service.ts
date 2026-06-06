import { Injectable } from '@nestjs/common';
import { NightCanteenRepository } from './night-canteen.repository';
import {
  NightCanteenItemQueryDto,
  NightCanteenOrderQueryDto,
} from './dto/night-canteen-query.dto';
import { CreateCanteenItemDto } from './dto/create-canteen-item.dto';
import { UpdateCanteenItemDto } from './dto/update-canteen-item.dto';
import { CreateCanteenOrderDto } from './dto/create-canteen-order.dto';
import { UpdateCanteenOrderDto } from './dto/update-canteen-order.dto';

@Injectable()
export class NightCanteenService {
  constructor(private readonly repo: NightCanteenRepository) {}

  findItems(query: NightCanteenItemQueryDto) {
    return this.repo.findItems(query);
  }

  findItemById(id: string) {
    return this.repo.findItemById(id);
  }

  createItem(data: CreateCanteenItemDto) {
    return this.repo.createItem(data);
  }

  upsertItem(id: string, data: CreateCanteenItemDto) {
    return this.repo.upsertItem(id, data);
  }

  updateItem(id: string, data: UpdateCanteenItemDto) {
    return this.repo.updateItem(id, data);
  }

  deleteItem(id: string) {
    return this.repo.deleteItem(id);
  }

  findOrders(query: NightCanteenOrderQueryDto) {
    return this.repo.findOrders(query);
  }

  findOrderById(id: string) {
    return this.repo.findOrderById(id);
  }

  createOrder(data: CreateCanteenOrderDto) {
    return this.repo.createOrder(data);
  }

  updateOrder(id: string, data: UpdateCanteenOrderDto) {
    return this.repo.updateOrder(id, data);
  }

  deleteOrder(id: string) {
    return this.repo.deleteOrder(id);
  }
}
