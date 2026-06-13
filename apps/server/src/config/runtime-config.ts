
const parseBoolean = (
  value: string | undefined,
  fallback: boolean,
): boolean => {
  if (value == null || value.trim() === '') {
    return fallback;
  }

  return value.trim().toLowerCase() === 'true';
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export const getAllowedCorsOrigins = (): string[] => {
  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins;
};

export const getCorsConfig = () => {
  const origins = getAllowedCorsOrigins();

  return {
    origins,
    allowCredentials: parseBoolean(process.env.CORS_ALLOW_CREDENTIALS, true),
    allowedMethods: [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'Origin',
      'X-Captcha-Token',
      'X-CSRF-Token',
      'X-Request-Id',
      'X-Requested-With',
    ],
    exposedHeaders: ['x-request-id'],
    maxAgeSeconds: parseNumber(process.env.CORS_MAX_AGE_SECONDS, 86_400),
  };
};

export const getBodySizeLimit = (): string =>
  process.env.REQUEST_BODY_LIMIT?.trim() || '1mb';

export const isProduction = (): boolean =>
  (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
