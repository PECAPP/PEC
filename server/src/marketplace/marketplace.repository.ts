import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';

@Injectable()
export class MarketplaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Listings ────────────────────────────────────────────────────────────────

  async findListings(query: ListingQueryDto) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const where: Prisma.MarketplaceListingWhereInput = {
      status: 'Available',
      ...(query.category ? { category: query.category } : {}),
      ...(query.condition ? { condition: query.condition } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined ? { gte: Number(query.minPrice) } : {}),
              ...(query.maxPrice !== undefined ? { lte: Number(query.maxPrice) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const validSortFields = ['createdAt', 'price'];
    const sortBy = validSortFields.includes(query.sortBy ?? '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      this.prisma.marketplaceListing.count({ where }),
      this.prisma.marketplaceListing.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
        include: {
          seller: { select: { id: true, name: true, avatar: true, studentProfile: { select: { phone: true } } } },
          _count: { select: { bookmarks: true } },
        },
      }),
    ]);

    return { items, total, limit, offset };
  }

  findListingById(id: string) {
    return this.prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, avatar: true, studentProfile: { select: { phone: true } } } },
        _count: { select: { bookmarks: true } },
      },
    });
  }

  async findMyListings(sellerId: string) {
    return this.prisma.marketplaceListing.findMany({
      where: { sellerId, NOT: { status: 'Deleted' } },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { bookmarks: true } } },
    });
  }

  createListing(sellerId: string, data: CreateListingDto) {
    return this.prisma.marketplaceListing.create({
      data: {
        title: data.title,
        description: data.description ?? '',
        price: Number(data.price),
        category: data.category,
        condition: data.condition,
        images: data.images ?? [],
        sellerId,
      },
    });
  }

  async updateListing(id: string, userId: string, data: UpdateListingDto) {
    const listing = await this.prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId !== userId) throw new ForbiddenException('Not your listing');

    return this.prisma.marketplaceListing.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: Number(data.price) } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.condition !== undefined ? { condition: data.condition } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  }

  async deleteListing(id: string, userId: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId !== userId) throw new ForbiddenException('Not your listing');
    return this.prisma.marketplaceListing.update({ where: { id }, data: { status: 'Deleted' } });
  }

  // ─── Bookmarks ───────────────────────────────────────────────────────────────

  async toggleBookmark(userId: string, listingId: string) {
    const existing = await this.prisma.marketplaceBookmark.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) {
      await this.prisma.marketplaceBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await this.prisma.marketplaceBookmark.create({ data: { userId, listingId } });
    return { bookmarked: true };
  }

  async getBookmarks(userId: string) {
    const bookmarks = await this.prisma.marketplaceBookmark.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: { select: { id: true, name: true, avatar: true } },
            _count: { select: { bookmarks: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookmarks.filter((b) => b.listing.status !== 'Deleted').map((b) => b.listing);
  }

  async getBookmarkedIds(userId: string) {
    const bookmarks = await this.prisma.marketplaceBookmark.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return bookmarks.map((b) => b.listingId);
  }

  // ─── Chats ───────────────────────────────────────────────────────────────────

  async getOrCreateChat(listingId: string, buyerId: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId === buyerId) throw new ForbiddenException('Cannot chat with yourself');

    const existing = await this.prisma.marketplaceChat.findUnique({
      where: { listingId_buyerId: { listingId, buyerId } },
      include: { messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, avatar: true } } } } },
    });
    if (existing) return existing;

    return this.prisma.marketplaceChat.create({
      data: { listingId, buyerId },
      include: { messages: true },
    });
  }

  async getMyChats(userId: string) {
    return this.prisma.marketplaceChat.findMany({
      where: { OR: [{ buyerId: userId }, { listing: { sellerId: userId } }] },
      include: {
        listing: { select: { id: true, title: true, images: true, price: true, sellerId: true } },
        buyer: { select: { id: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getChatMessages(chatId: string, userId: string) {
    const chat = await this.prisma.marketplaceChat.findUnique({
      where: { id: chatId },
      include: { listing: { select: { sellerId: true } } },
    });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.buyerId !== userId && chat.listing.sellerId !== userId) {
      throw new ForbiddenException('Not a participant');
    }
    return this.prisma.marketplaceMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async sendMessage(chatId: string, senderId: string, text: string) {
    const chat = await this.prisma.marketplaceChat.findUnique({
      where: { id: chatId },
      include: { listing: { select: { sellerId: true } } },
    });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.buyerId !== senderId && chat.listing.sellerId !== senderId) {
      throw new ForbiddenException('Not a participant');
    }
    const message = await this.prisma.marketplaceMessage.create({
      data: { chatId, senderId, text },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
    await this.prisma.marketplaceChat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
    return message;
  }
}
