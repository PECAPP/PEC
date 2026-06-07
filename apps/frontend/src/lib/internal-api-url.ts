const DEFAULT_INTERNAL_API_BASE = 'http://localhost:4000/api/v1';

export const resolveInternalApiBaseUrl = (): string => {
  const configured =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_INTERNAL_API_BASE;

  const normalized = configured.trim().replace(/\/$/, '');
  if (!normalized) {
    return DEFAULT_INTERNAL_API_BASE;
  }

  if (normalized.includes('/api/v1')) return normalized;
  if (normalized.endsWith('/api')) return `${normalized}/v1`;
  return `${normalized}/api/v1`;
};
