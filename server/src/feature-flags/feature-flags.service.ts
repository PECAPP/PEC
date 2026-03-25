import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CachedFlag = {
  value: {
    key: string;
    enabled: boolean;
    description: string | null;
    payload: string | null;
    updatedAt: Date;
  };
  expiresAt: number;
};

@Injectable()
export class FeatureFlagsService {
  private readonly cache = new Map<string, CachedFlag>();
  private readonly ttlMs = Number(
    process.env.FEATURE_FLAG_CACHE_TTL_MS ?? '30000',
  );

  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    return this.prisma.featureFlag.findMany({
      orderBy: [{ key: 'asc' }],
    });
  }

  async getByKey(key: string) {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const featureFlag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!featureFlag) {
      throw new NotFoundException('Feature flag not found');
    }

    this.cache.set(key, {
      value: featureFlag,
      expiresAt: now + this.ttlMs,
    });

    return featureFlag;
  }

  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.getByKey(key);
    return flag.enabled;
  }

  async upsert(
    key: string,
    input: { enabled: boolean; description?: string; payload?: string },
  ) {
    const featureFlag = await this.prisma.featureFlag.upsert({
      where: { key },
      update: {
        enabled: input.enabled,
        description: input.description ?? null,
        payload: input.payload ?? null,
      },
      create: {
        key,
        enabled: input.enabled,
        description: input.description ?? null,
        payload: input.payload ?? null,
      },
    });

    this.cache.set(key, {
      value: featureFlag,
      expiresAt: Date.now() + this.ttlMs,
    });

    return featureFlag;
  }
}
