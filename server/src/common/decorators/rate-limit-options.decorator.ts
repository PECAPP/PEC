import { SetMetadata } from '@nestjs/common';

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
  banAfterExceeded?: number;
  banDurationMs?: number;
  requireCaptchaAfterExceeded?: number;
};

export const RATE_LIMIT_OPTIONS_KEY = 'rateLimitOptions';
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_OPTIONS_KEY, options);
