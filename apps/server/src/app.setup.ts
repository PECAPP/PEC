import { INestApplication } from '@nestjs/common';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { ZodValidationFilter } from './filters/zod-validation.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { FastifyRequest, FastifyReply } from 'fastify';
import helmet from '@fastify/helmet';
import {
  getAllowedCorsOrigins,
  getBodySizeLimit,
  getCorsConfig,
  isProduction,
} from './config/runtime-config';
import { VersioningType } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';

export const configureApp = (app: INestApplication): void => {
  const fastifyApp = app as NestFastifyApplication;
  fastifyApp.register(fastifyCookie);
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  enforceLeastPrivilegeDatabaseUser();
  const corsConfig = getCorsConfig();
  const bodySizeLimit = getBodySizeLimit();
  const allowedOrigins = new Set(corsConfig.origins);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      console.error(`[CORS Error] Origin rejected: "${origin}". Allowed origins:`, Array.from(allowedOrigins));
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: corsConfig.allowedMethods,
    allowedHeaders: corsConfig.allowedHeaders,
    exposedHeaders: corsConfig.exposedHeaders,
    credentials: corsConfig.allowCredentials,
    maxAge: corsConfig.maxAgeSeconds,
  });

  fastifyApp.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests: isProduction() ? [] : null,
      },
    },
    frameguard: { action: 'deny' },
    hsts: isProduction()
      ? {
          maxAge: 31_536_000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    crossOriginResourcePolicy: false,
  });

  // Fastify handles trust proxy and x-powered-by differently, usually in the adapter or via direct config.

  if (isProduction()) {
    fastifyApp.getInstance().addHook('onRequest', (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
      const forwardedProto = String(req.headers['x-forwarded-proto'] ?? '')
        .split(',')[0]
        .trim();

      if (req.protocol === 'https' || forwardedProto === 'https') {
        done();
        return;
      }

      reply.redirect(301, `https://${req.hostname}${req.url}`);
    });
  }

  app.useGlobalInterceptors(new AuditInterceptor());
  app.useGlobalFilters(new ZodValidationFilter());

  app.useGlobalPipes(
    new ZodValidationPipe()
  );
};

const enforceLeastPrivilegeDatabaseUser = (): void => {
  if (!isProduction()) {
    return;
  }

  if (process.env.JEST_WORKER_ID) {
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return;
  }

  const parsed = new URL(connectionString);
  const username = parsed.username?.toLowerCase();
  const blocked = new Set(['postgres', 'root', 'admin', 'sa']);

  if (username && blocked.has(username)) {
    throw new Error(
      `DATABASE_URL is using a privileged DB user (${username}). Configure a least-privilege application user for production.`,
    );
  }

  getAllowedCorsOrigins();
};
