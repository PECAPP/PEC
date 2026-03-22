import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  use(req: any, res: any, next: () => void): void {
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers?.['user-agent'];

    this.logger.log(
      JSON.stringify({
        event: 'request:start',
        requestId,
        method,
        path: originalUrl,
        ip,
        userAgent,
      }),
    );

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const actor = req.user as { sub?: string; role?: string } | undefined;
      const ipAddress =
        typeof req.headers?.['x-forwarded-for'] === 'string'
          ? req.headers['x-forwarded-for'].split(',')[0].trim()
          : req.ip;
      const isSensitiveStatus = [401, 403, 429].includes(res.statusCode);
      const isAuthPath = String(originalUrl).startsWith('/auth');

      this.logger.log(
        JSON.stringify({
          event: 'request:end',
          requestId,
          method,
          path: originalUrl,
          statusCode: res.statusCode,
          durationMs,
          actorUserId: actor?.sub ?? null,
        }),
      );

      if (isSensitiveStatus || isAuthPath) {
        this.logger.warn(
          JSON.stringify({
            event: 'security:signal',
            requestId,
            method,
            path: originalUrl,
            statusCode: res.statusCode,
            actorUserId: actor?.sub ?? null,
            actorRole: actor?.role ?? null,
            ip: ipAddress ?? null,
            userAgent,
          }),
        );
      }

      if (this.shouldPersistAuditTrail(method, originalUrl, actor)) {
        void this.prisma.auditLog
          .create({
            data: {
              actorUserId: actor?.sub ?? null,
              actorRole: actor?.role ?? null,
              action: `HTTP_${method}`,
              entity: 'request',
              entityId: requestId,
              method,
              path: originalUrl,
              ip: ipAddress ?? null,
              statusCode: res.statusCode,
              metadata: JSON.stringify({
                durationMs,
                requestId,
                userAgent,
              }),
            },
          })
          .catch((error: unknown) => {
            this.logger.warn(`Failed to write audit log: ${String(error)}`);
          });
      }
    });

    next();
  }

  private shouldPersistAuditTrail(
    method: string,
    path: string,
    actor?: { sub?: string; role?: string },
  ): boolean {
    if (path === '/' || path.startsWith('/health')) {
      return false;
    }

    if (actor?.sub) {
      return true;
    }

    return ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
  }
}
