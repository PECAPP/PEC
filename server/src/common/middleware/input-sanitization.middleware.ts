import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import mongoSanitize from 'mongo-sanitize';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void): void {
    this.assignSanitizedValue(
      req,
      'body',
      this.sanitizePayload(req.body, 'body'),
    );
    this.assignSanitizedValue(
      req,
      'query',
      this.sanitizePayload(req.query, 'query'),
    );
    this.assignSanitizedValue(
      req,
      'params',
      this.sanitizePayload(req.params, 'params'),
    );
    next();
  }

  private assignSanitizedValue(
    req: Record<string, unknown>,
    key: 'body' | 'query' | 'params',
    value: unknown,
  ): void {
    const current = req[key];

    if (
      current &&
      typeof current === 'object' &&
      value &&
      typeof value === 'object'
    ) {
      for (const existingKey of Object.keys(
        current as Record<string, unknown>,
      )) {
        delete (current as Record<string, unknown>)[existingKey];
      }

      Object.assign(current as Record<string, unknown>, value);
      return;
    }

    Object.defineProperty(req, key, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  private sanitizePayload<T>(payload: T, source: string): T {
    if (payload == null) {
      return payload;
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitizePayload(item, source)) as T;
    }

    if (typeof payload === 'string') {
      return this.sanitizeString(payload) as T;
    }

    if (typeof payload !== 'object') {
      return payload;
    }

    const sanitizedObject = mongoSanitize(payload as Record<string, unknown>);
    const nextObject: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(sanitizedObject)) {
      if (key.startsWith('$') || key.includes('.')) {
        throw new BadRequestException(`Invalid key detected in ${source}`);
      }
      nextObject[key] = this.sanitizePayload(value, source);
    }

    return nextObject as T;
  }

  private sanitizeString(value: string): string {
    const sanitized = sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
    });
    return sanitized.trim();
  }
}
