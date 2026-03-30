import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { ListNoticesDto } from './dto/list-notices.dto';

type NoticeMedia = {
  url: string;
  kind: 'image' | 'audio' | 'video' | 'file';
  name?: string;
  mimeType?: string;
  sizeBytes?: number;
};

@Injectable()
export class NoticeboardService {
  constructor(private readonly prisma: PrismaService) {}

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
      deletedAt: null,
      ...(query.category ? { category: query.category } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      prismaAny.notice.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
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

    return {
      id: created.id,
      title: created.title,
      content: created.content,
      category: created.category,
      important: created.important,
      pinned: created.pinned,
      media,
      authorId: created.author?.id ?? null,
      authorName: created.author?.name ?? 'Unknown',
      authorEmail: created.author?.email ?? null,
      publishedAt: created.publishedAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
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

  async remove(id: string) {
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
      data: { deletedAt: new Date() },
      select: {
        id: true,
      },
    });
  }
}
