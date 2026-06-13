import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readReplicas } from '@prisma/extension-read-replicas';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

export const dbContext = new AsyncLocalStorage<{ userId?: string; role?: string }>();

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    try {
      dotenv.config();
    } catch (e) {}
  }
  
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
                if ((model as string) === 'AcademicCalendar' && (args as any).data) {
                  const dataObj = (args as any).data;
                  if (Array.isArray(dataObj)) {
                    (args as any).data = dataObj.map((d: any) => ({ ...d, createdBy: d.createdBy || userId }));
                  } else {
                    dataObj.createdBy = dataObj.createdBy || userId;
                  }
                }
              }
            }

            const modelsWithSoftDelete = ['Course', 'FeeRecord', 'Notice', 'ExamSchedule'];
            if (modelsWithSoftDelete.includes(model)) {
              if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
                args.where = { ...args.where, deletedAt: null };
              }
            }

            // RLS Logic for students
            if (context?.role === 'student' && ['findMany', 'findFirst', 'count'].includes(operation)) {
              if (['Attendance', 'AttendanceSession', 'ScoreEntry', 'CgpaEntry'].includes(model as string)) {
                args.where = args.where || {};
                if (model === 'CgpaEntry') {
                  args.where.userId = userId;
                } else if (model === 'ScoreEntry' || model === 'Attendance') {
                  args.where.studentId = userId;
                }
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
              } else if ((args as any).where && 'id' in (args as any).where) {
                entityId = ((args as any).where as any).id;
              }

              // Fire and forget audit log creation
              Promise.resolve().then(() => {
                const pool = new Pool({ connectionString: process.env.DATABASE_URL });
                pool.query(
                  'INSERT INTO "AuditLog" (id, "actorUserId", "actorRole", action, entity, "entityId", method, path, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
                  [
                    randomUUID(),
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
