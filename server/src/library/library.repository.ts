import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookQueryDto } from './dto/book-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class LibraryRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: BookQueryDto) {
    const where = {
      deletedAt: null,
      ...(query.category ? { category: query.category } : {}),
      ...(query.author ? { author: query.author } : {}),
      ...(query.title
        ? { title: { contains: query.title, mode: 'insensitive' as const } }
        : {}),
      ...(query.availableOnly === 'true' ? { availableCopies: { gt: 0 } } : {}),
    };

    return this.findManyWithCount(this.prisma.book, {
      query,
      defaultLimit: 20,
      where,
      orderBy: { title: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.book.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: CreateBookDto) {
    return this.prisma.book.create({ data });
  }
}
