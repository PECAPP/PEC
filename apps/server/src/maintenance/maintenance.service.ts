import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from '../auth/auth.service';

/**
 * Scheduled maintenance tasks:
 * - Daily pruning of expired email/password-reset/refresh tokens (#13)
 */
@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async pruneExpiredTokens(): Promise<void> {
    this.logger.log('[Maintenance] Starting expired token pruning...');
    try {
      const result = await this.authService.pruneExpiredTokens();
      this.logger.log(
        `[Maintenance] Pruned: ${result.emailTokens} email tokens, ` +
        `${result.resetTokens} reset tokens, ${result.refreshTokens} refresh tokens.`
      );
    } catch (err) {
      this.logger.error('[Maintenance] Token pruning failed', err);
    }
  }
}
