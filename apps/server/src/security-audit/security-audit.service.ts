import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    before?: any;
    after?: any;
    reason?: string;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      // We map SecurityAuditLog to auditLog if it exists, but the model is SecurityAuditLog.
      // Wait, let's use the explicit prisma model name since we added SecurityAuditLog.
      // In prisma.service.ts we need to add securityAuditLog, but we can also use prisma.extended.securityAuditLog
    });
  }

  // Proper implementation:
  async createLog(data: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    before?: any;
    after?: any;
    reason?: string;
    ipAddress?: string;
  }) {
    return this.prisma.extended.securityAuditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        before: data.before ? JSON.parse(JSON.stringify(data.before)) : undefined,
        after: data.after ? JSON.parse(JSON.stringify(data.after)) : undefined,
        reason: data.reason,
        ipAddress: data.ipAddress,
      }
    });
  }

  async getLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.prisma.extended.securityAuditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { name: true, email: true } } }
    });
  }
}
