import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { ListNoticesDto } from './dto/list-notices.dto';
import { EventsGateway } from '../events/events.gateway';

type NoticeMedia = {
  url: string;
  kind: 'image' | 'audio' | 'video' | 'file';
  name?: string;
  mimeType?: string;
  sizeBytes?: number;
};

@Injectable()
export class NoticeboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private parseMedia(mediaJson: string | null): NoticeMedia[] {
    if (!mediaJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(mediaJson);
      return Array.isArray(parsed) ? (parsed as NoticeMedia[]) : [];
    } catch {
      return [];
    }
  }

  async list(query: ListNoticesDto) {
    const prismaAny = this.prisma as any;
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
    const offset = Math.max(query.offset ?? 0, 0);

    const where = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.priorityLevel ? { priorityLevel: query.priorityLevel } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      prismaAny.notice.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ pinned: 'desc' }, { priorityLevel: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prismaAny.notice.count({ where }),
    ]);

    return {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        important: item.important,
        priorityLevel: item.priorityLevel,
        pinned: item.pinned,
        media: this.parseMedia(item.mediaJson),
        authorId: item.author?.id ?? null,
        authorName: item.author?.name ?? 'Unknown',
        authorEmail: item.author?.email ?? null,
        publishedAt: item.publishedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total,
      limit,
      offset,
    };
  }

  async create(dto: CreateNoticeDto, authorId: string) {
    const prismaAny = this.prisma as any;
    const media = (dto.media ?? []).slice(0, 8).map((item) => ({
      url: String(item.url || '').trim(),
      kind: item.kind,
      name: item.name?.trim() || undefined,
      mimeType: item.mimeType?.trim() || undefined,
      sizeBytes: typeof item.sizeBytes === 'number' ? item.sizeBytes : undefined,
    }));

    const created = await prismaAny.notice.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        category: dto.category ?? 'update',
        important: !!dto.important,
        priorityLevel: dto.priorityLevel ?? 2,
        pinned: !!dto.pinned,
        mediaJson: media.length > 0 ? JSON.stringify(media) : null,
        authorId,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const responsePayload = {
      id: created.id,
      title: created.title,
      content: created.content,
      category: created.category,
      important: created.important,
      priorityLevel: created.priorityLevel,
      pinned: created.pinned,
      media,
      authorId: created.author?.id ?? null,
      authorName: created.author?.name ?? 'Unknown',
      authorEmail: created.author?.email ?? null,
      publishedAt: created.publishedAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    this.eventsGateway.emitToAll('newNotice', responsePayload);

    return responsePayload;
  }

  async togglePin(id: string, pinned: boolean) {
    const prismaAny = this.prisma as any;
    const existing = await prismaAny.notice.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Notice not found');
    }

    return prismaAny.notice.update({
      where: { id },
      data: { pinned },
      select: {
        id: true,
        pinned: true,
      },
    });
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const prismaAny = this.prisma as any;
    const existing = await prismaAny.notice.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Notice not found');
    }

    const dataToUpdate: any = {};
    if (dto.title !== undefined) dataToUpdate.title = dto.title.trim();
    if (dto.content !== undefined) dataToUpdate.content = dto.content.trim();
    if (dto.category !== undefined) dataToUpdate.category = dto.category;
    if (dto.important !== undefined) dataToUpdate.important = dto.important;
    if (dto.priorityLevel !== undefined) dataToUpdate.priorityLevel = dto.priorityLevel;
    if (dto.pinned !== undefined) dataToUpdate.pinned = dto.pinned;
    
    if (dto.mediaJson !== undefined) {
      if (dto.mediaJson === null) {
        dataToUpdate.mediaJson = null;
      } else {
        const parsed = this.parseMedia(dto.mediaJson);
        dataToUpdate.mediaJson = JSON.stringify(parsed);
      }
    }

    const updated = await prismaAny.notice.update({
      where: { id },
      data: dataToUpdate,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const responsePayload = {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      category: updated.category,
      important: updated.important,
      priorityLevel: updated.priorityLevel,
      pinned: updated.pinned,
      media: this.parseMedia(updated.mediaJson),
      authorId: updated.author?.id ?? null,
      authorName: updated.author?.name ?? 'Unknown',
      authorEmail: updated.author?.email ?? null,
      publishedAt: updated.publishedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    this.eventsGateway.emitToAll('noticeUpdated', responsePayload);

    return responsePayload;
  }

  async remove(id: string) {
    const prismaAny = this.prisma as any;
    const existing = await prismaAny.notice.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Notice not found');
    }

    const deleted = await prismaAny.notice.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: {
        id: true,
      },
    });

    this.eventsGateway.emitToAll('noticeDeleted', { id });

    return deleted;
  }
}
