import { Prisma } from '@prisma/client';

export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        if (!args.where) args.where = {};
        if (args.where.deletedAt === undefined) {
           args.where.deletedAt = null;
        }
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        if (!args.where) args.where = {};
        if (args.where.deletedAt === undefined) {
           args.where.deletedAt = null;
        }
        return query(args);
      },
      async count({ model, operation, args, query }) {
        if (!args.where) args.where = {};
        if (args.where.deletedAt === undefined) {
           args.where.deletedAt = null;
        }
        return query(args);
      },
    },
  },
});
