import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response, json, urlencoded } from 'express';
import helmet from 'helmet';
import {
  getAllowedCorsOrigins,
  getBodySizeLimit,
  getCorsConfig,
  isProduction,
} from './config/runtime-config';

export const configureApp = (app: INestApplication): void => {
  app.setGlobalPrefix('api');
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

  app.use(
    helmet({
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
      noSniff: true,
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.disable('x-powered-by');
  expressApp.set('trust proxy', 1);
  expressApp.use(json({ limit: bodySizeLimit }));
  expressApp.use(urlencoded({ extended: false, limit: bodySizeLimit }));

  if (isProduction()) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const forwardedProto = String(req.headers['x-forwarded-proto'] ?? '')
        .split(',')[0]
        .trim();

      if (req.secure || forwardedProto === 'https') {
        next();
        return;
      }

      res.redirect(301, `https://${req.headers.host}${req.url}`);
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
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
