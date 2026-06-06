import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  RATE_LIMIT_OPTIONS_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit-options.decorator';
import { SKIP_RATE_LIMIT_KEY } from '../decorators/skip-rate-limit.decorator';

type RequestEntry = {
  count: number;
  expiresAt: number;
};

type ViolationEntry = {
  count: number;
  expiresAt: number;
};

type BanEntry = {
  expiresAt: number;
  reason: string;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly requests = new Map<string, RequestEntry>();
  private readonly violations = new Map<string, ViolationEntry>();
  private readonly ipBans = new Map<string, BanEntry>();
  private readonly defaultWindowMs = 60_000;
  private readonly defaultLimit = 120;
  private readonly authWindowMs = 60_000;
  private readonly authLimit = 10;
  private readonly authCaptchaThreshold = 3;
  private readonly defaultBanAfterExceeded = 5;
  private readonly defaultBanDurationMs = 30 * 60_000;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skip) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const path = String(request?.route?.path || request?.url || 'unknown');
    const ip = this.extractClientIp(request);
    const now = Date.now();

    this.cleanupExpired(now);

    const activeBan = this.ipBans.get(ip);
    if (activeBan && activeBan.expiresAt > now) {
      throw new HttpException(
        {
          success: false,
          error: 'IP temporarily banned due to abusive traffic',
          reason: activeBan.reason,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((activeBan.expiresAt - now) / 1000),
          ),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const customLimits = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_OPTIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const routeLimits = this.resolveRouteLimits(path, customLimits);
    const key = `${ip}:${path}`;

    const existing = this.requests.get(key);
    if (!existing || existing.expiresAt <= now) {
      this.requests.set(key, {
        count: 1,
        expiresAt: now + routeLimits.windowMs,
      });
    } else if (existing.count >= routeLimits.limit) {
      const violation = this.incrementViolation(ip, now, routeLimits.windowMs);
      const shouldRequireCaptcha =
        violation.count >= routeLimits.requireCaptchaAfterExceeded;

      if (violation.count >= routeLimits.banAfterExceeded) {
        const banUntil = now + routeLimits.banDurationMs;
        this.ipBans.set(ip, {
          expiresAt: banUntil,
          reason: `Exceeded limit on ${path}`,
        });
        this.logger.warn(
          `Banned IP ${ip} until ${new Date(banUntil).toISOString()} on ${path}`,
        );
      }

      const captchaSatisfied = this.isCaptchaSatisfied(request);
      if (
        shouldRequireCaptcha &&
        !captchaSatisfied &&
        this.isSensitivePath(path)
      ) {
        throw new HttpException(
          {
            success: false,
            error: 'Additional verification required',
            captchaRequired: true,
            retryAfterSeconds: Math.max(
              1,
              Math.ceil((existing.expiresAt - now) / 1000),
            ),
          },
          HttpStatus.FORBIDDEN,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((existing.expiresAt - now) / 1000),
          ),
          captchaRequired:
            shouldRequireCaptcha &&
            this.isSensitivePath(path) &&
            !captchaSatisfied,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      existing.count += 1;
      this.requests.set(key, existing);
    }

    const ipViolation = this.violations.get(ip);
    if (
      ipViolation &&
      ipViolation.count >= routeLimits.requireCaptchaAfterExceeded &&
      this.isSensitivePath(path) &&
      !this.isCaptchaSatisfied(request)
    ) {
      throw new HttpException(
        {
          success: false,
          error: 'Additional verification required',
          captchaRequired: true,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }

  private resolveRouteLimits(
    routePath: string,
    custom?: RateLimitOptions,
  ): Required<RateLimitOptions> {
    if (custom) {
      return {
        limit: custom.limit,
        windowMs: custom.windowMs,
        banAfterExceeded:
          custom.banAfterExceeded ?? this.defaultBanAfterExceeded,
        banDurationMs: custom.banDurationMs ?? this.defaultBanDurationMs,
        requireCaptchaAfterExceeded:
          custom.requireCaptchaAfterExceeded ?? this.authCaptchaThreshold,
      };
    }

    if (routePath.includes('/auth/login') || routePath.includes('/otp')) {
      return {
        limit: this.authLimit,
        windowMs: this.authWindowMs,
        banAfterExceeded: 4,
        banDurationMs: 60 * 60_000,
        requireCaptchaAfterExceeded: this.authCaptchaThreshold,
      };
    }

    if (routePath.includes('/payment') || routePath.includes('/finance')) {
      return {
        limit: 15,
        windowMs: 60_000,
        banAfterExceeded: 5,
        banDurationMs: 45 * 60_000,
        requireCaptchaAfterExceeded: 2,
      };
    }

    return {
      limit: this.defaultLimit,
      windowMs: this.defaultWindowMs,
      banAfterExceeded: this.defaultBanAfterExceeded,
      banDurationMs: this.defaultBanDurationMs,
      requireCaptchaAfterExceeded: 6,
    };
  }

  private incrementViolation(
    ip: string,
    now: number,
    windowMs: number,
  ): ViolationEntry {
    const current = this.violations.get(ip);
    if (!current || current.expiresAt <= now) {
      const fresh = { count: 1, expiresAt: now + windowMs };
      this.violations.set(ip, fresh);
      return fresh;
    }

    current.count += 1;
    this.violations.set(ip, current);
    return current;
  }

  private isSensitivePath(routePath: string): boolean {
    return (
      routePath.includes('/auth/') ||
      routePath.includes('/otp') ||
      routePath.includes('/payment') ||
      routePath.includes('/finance')
    );
  }

  private isCaptchaSatisfied(request: any): boolean {
    const expected = process.env.CAPTCHA_BYPASS_TOKEN;
    if (!expected) {
      return true;
    }

    const provided = String(request?.headers?.['x-captcha-token'] ?? '');
    return provided.length > 0 && provided === expected;
  }

  private extractClientIp(request: any): string {
    const forwarded = request?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    return request?.ip || request?.socket?.remoteAddress || 'unknown';
  }

  private cleanupExpired(now: number): void {
    for (const [key, value] of this.requests.entries()) {
      if (value.expiresAt <= now) {
        this.requests.delete(key);
      }
    }

    for (const [ip, value] of this.violations.entries()) {
      if (value.expiresAt <= now) {
        this.violations.delete(ip);
      }
    }

    for (const [ip, value] of this.ipBans.entries()) {
      if (value.expiresAt <= now) {
        this.ipBans.delete(ip);
      }
    }
  }
}
