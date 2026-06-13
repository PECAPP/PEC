import { Prisma } from '@pec/database';
import { AsyncLocalStorage } from 'async_hooks';

export const rlsContext = new AsyncLocalStorage<{
  userId: string;
  role: string;
  roles: string[];
}>();

export function createRlsMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const ctx = rlsContext.getStore();
    if (!ctx) return next(params);

    const { userId, roles } = ctx;
    const isStudent = roles.includes('student');
    const isAdmin = roles.includes('college_admin');

    if (isAdmin) {
      return next(params);
    }

    if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'count') {
      if (
        params.model === 'Attendance' ||
        params.model === 'AttendanceSession' ||
        params.model === 'ScoreEntry' ||
        params.model === 'CgpaEntry'
      ) {
        if (isStudent) {
          params.args = params.args || {};
          params.args.where = params.args.where || {};
          
          if (params.model === 'CgpaEntry') {
            params.args.where.userId = userId;
          } else if (params.model === 'ScoreEntry' || params.model === 'Attendance') {
            params.args.where.studentId = userId;
          }
        }
      }
    }

    return next(params);
  };
}
