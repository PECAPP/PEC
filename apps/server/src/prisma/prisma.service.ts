import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@pec/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readReplicas } from '@prisma/extension-read-replicas';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public readonly extended: ReturnType<typeof this.getExtendedClient>;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: [],
    });

    this.extended = this.getExtendedClient();
  }

  private getExtendedClient() {
    const replicaPool = new Pool({ connectionString: process.env.REPLICA_URL || process.env.DATABASE_URL });
    const replicaAdapter = new PrismaPg(replicaPool);
    const replicaClient = new PrismaClient({ adapter: replicaAdapter, log: [] });

    return this.$extends(
      readReplicas({
        replicas: [replicaClient],
      })
    ).$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const modelsWithSoftDelete = ['Course', 'FeeRecord', 'Notice', 'ExamSchedule', 'Job'];
            if (modelsWithSoftDelete.includes(model)) {
              if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
                args.where = { ...args.where, deletedAt: null };
              }
            }
            return query(args);
          },
        },
      },
    }) as any; // Type assertion needed due to dynamic extension chaining 
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
