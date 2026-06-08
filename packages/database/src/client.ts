import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readReplicas } from '@prisma/extension-read-replicas';
import { AsyncLocalStorage } from 'async_hooks';

export const dbContext = new AsyncLocalStorage<{ userId?: string; role?: string }>();

const createPrismaClient = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  
  const baseClient = new PrismaClient({ adapter, log: [] });
  
  const replicaPool = new Pool({ connectionString: process.env.REPLICA_URL || process.env.DATABASE_URL });
  const replicaAdapter = new PrismaPg(replicaPool);
  const replicaClient = new PrismaClient({ adapter: replicaAdapter, log: [] });

  return baseClient
    .$extends(
      readReplicas({
        replicas: [replicaClient],
      })
    )
    .$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const context = dbContext.getStore();
            const userId = context?.userId;

            // Audit trails
            if (userId) {
              if (operation === 'create' || operation === 'createMany') {
                if (args.data) {
                  if (Array.isArray(args.data)) {
                    args.data = args.data.map(d => ({ ...d, createdBy: (d as any).createdBy || userId }));
                  } else {
                    (args.data as any).createdBy = (args.data as any).createdBy || userId;
                  }
                }
              }
              if (operation === 'update' || operation === 'updateMany') {
                if (args.data) {
                  (args.data as any).updatedBy = (args.data as any).updatedBy || userId;
                }
              }
            }

            const modelsWithSoftDelete = ['Course', 'FeeRecord', 'Notice', 'ExamSchedule', 'Job'];
            if (modelsWithSoftDelete.includes(model)) {
              if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
                args.where = { ...args.where, deletedAt: null };
              }
            }
            const criticalModels = ['FeeRecord', 'Course', 'User'];
            const writeOperations = ['create', 'createMany', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];

            const result = await query(args);

            if (userId && criticalModels.includes(model as string) && writeOperations.includes(operation)) {
              const action = operation.toUpperCase();
              let entityId: string | null = null;

              if ('id' in (result as any)) {
                entityId = (result as any).id;
              } else if (args.where && 'id' in args.where) {
                entityId = (args.where as any).id;
              }

              // Fire and forget audit log creation
              Promise.resolve().then(() => {
                const pool = new Pool({ connectionString: process.env.DATABASE_URL });
                pool.query(
                  'INSERT INTO "AuditLog" (id, "actorUserId", "actorRole", action, entity, "entityId", method, path, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
                  [
                    require('crypto').randomUUID(),
                    userId,
                    context?.role || 'system',
                    action,
                    model as string,
                    entityId,
                    'SYSTEM',
                    'PRISMA_EXTENSION'
                  ]
                ).catch(e => console.error('Failed to write audit log', e)).finally(() => pool.end());
              });
            }

            return result;
          },
        },
      },
    });
};

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> };

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
