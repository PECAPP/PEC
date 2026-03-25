import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type JobHandler = (payload: string | null) => Promise<void>;

@Injectable()
export class BackgroundJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackgroundJobsService.name);
  private readonly workerId = `worker-${process.pid}`;
  private readonly pollIntervalMs = Number(
    process.env.BACKGROUND_JOB_POLL_INTERVAL_MS ?? '5000',
  );
  private readonly staleLockMs = Number(
    process.env.BACKGROUND_JOB_STALE_LOCK_MS ?? '60000',
  );
  private timer: NodeJS.Timeout | null = null;
  private processing = false;
  private readonly handlers = new Map<string, JobHandler>();

  constructor(private readonly prisma: PrismaService) {
    this.handlers.set('audit-log.prune', async (payload) => {
      const config = payload
        ? (JSON.parse(payload) as { retentionDays?: number })
        : {};
      const retentionDays = Math.max(1, Number(config.retentionDays ?? 30));
      const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoff,
          },
        },
      });
    });
  }

  async onModuleInit() {
    if ((process.env.BACKGROUND_JOB_WORKER_ENABLED ?? 'true') !== 'true') {
      return;
    }

    this.timer = setInterval(() => {
      void this.processDueJobs();
    }, this.pollIntervalMs);

    void this.processDueJobs();
  }

  async onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  list(limit = 50) {
    return this.prisma.backgroundJob.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: Math.min(Math.max(limit, 1), 200),
    });
  }

  async enqueue(input: {
    type: string;
    payload?: string;
    dedupeKey?: string;
    runAt?: string;
    maxAttempts?: number;
  }) {
    return this.prisma.backgroundJob.upsert({
      where: {
        dedupeKey: input.dedupeKey ?? '__no_dedupe__',
      },
      update: input.dedupeKey
        ? {
            status: 'pending',
            payload: input.payload ?? null,
            runAt: input.runAt ? new Date(input.runAt) : new Date(),
            availableAt: input.runAt ? new Date(input.runAt) : new Date(),
            maxAttempts: input.maxAttempts ?? 5,
            lockedAt: null,
            lockedBy: null,
            failedAt: null,
            errorMessage: null,
          }
        : {},
      create: {
        type: input.type,
        payload: input.payload ?? null,
        dedupeKey: input.dedupeKey ?? null,
        runAt: input.runAt ? new Date(input.runAt) : new Date(),
        availableAt: input.runAt ? new Date(input.runAt) : new Date(),
        maxAttempts: input.maxAttempts ?? 5,
      },
    });
  }

  async enqueueAuditLogPrune(retentionDays = 30) {
    return this.enqueue({
      type: 'audit-log.prune',
      payload: JSON.stringify({ retentionDays }),
      dedupeKey: `audit-log.prune:${retentionDays}`,
    });
  }

  private async processDueJobs() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      await this.releaseStaleLocks();

      const candidate = await this.prisma.backgroundJob.findFirst({
        where: {
          status: {
            in: ['pending', 'retrying'],
          },
          availableAt: {
            lte: new Date(),
          },
          OR: [
            { lockedAt: null },
            { lockedAt: { lt: new Date(Date.now() - this.staleLockMs) } },
          ],
        },
        orderBy: [{ availableAt: 'asc' }, { createdAt: 'asc' }],
      });

      if (!candidate) {
        return;
      }

      const lockResult = await this.prisma.backgroundJob.updateMany({
        where: {
          id: candidate.id,
          OR: [
            { lockedAt: null },
            { lockedAt: { lt: new Date(Date.now() - this.staleLockMs) } },
          ],
        },
        data: {
          lockedAt: new Date(),
          lockedBy: this.workerId,
          status: 'processing',
        },
      });

      if (lockResult.count === 0) {
        return;
      }

      await this.runJob(candidate.id);
    } finally {
      this.processing = false;
    }
  }

  private async runJob(jobId: string) {
    const job = await this.prisma.backgroundJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return;
    }

    const handler = this.handlers.get(job.type);

    if (!handler) {
      await this.failJob(
        job,
        `No handler registered for job type "${job.type}"`,
      );
      return;
    }

    try {
      await handler(job.payload);
      await this.prisma.backgroundJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
          lockedAt: null,
          lockedBy: null,
          errorMessage: null,
        },
      });
    } catch (error) {
      await this.failJob(
        job,
        error instanceof Error ? error.message : 'Unknown job failure',
      );
    }
  }

  private async failJob(
    job: {
      id: string;
      attempts: number;
      maxAttempts: number;
    },
    errorMessage: string,
  ) {
    const attempts = job.attempts + 1;
    const exhausted = attempts >= job.maxAttempts;
    const retryDelayMs = Math.min(60_000, 2 ** attempts * 1000);

    this.logger.warn(`Background job ${job.id} failed: ${errorMessage}`);

    await this.prisma.backgroundJob.update({
      where: { id: job.id },
      data: {
        attempts,
        status: exhausted ? 'failed' : 'retrying',
        failedAt: exhausted ? new Date() : null,
        errorMessage: errorMessage.slice(0, 1000),
        availableAt: exhausted
          ? new Date()
          : new Date(Date.now() + retryDelayMs),
        lockedAt: null,
        lockedBy: null,
      },
    });
  }

  private async releaseStaleLocks() {
    await this.prisma.backgroundJob.updateMany({
      where: {
        status: 'processing',
        lockedAt: {
          lt: new Date(Date.now() - this.staleLockMs),
        },
      },
      data: {
        status: 'retrying',
        lockedAt: null,
        lockedBy: null,
      },
    });
  }
}
