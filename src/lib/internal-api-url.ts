const DEFAULT_INTERNAL_API_BASE = 'http://localhost:8000/api';

export const resolveInternalApiBaseUrl = (): string => {
  const configured =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_INTERNAL_API_BASE;

  const normalized = configured.trim().replace(/\/$/, '');
  if (!normalized) {
    return DEFAULT_INTERNAL_API_BASE;
  }

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};
