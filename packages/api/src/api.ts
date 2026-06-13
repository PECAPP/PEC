import { authClient } from "./auth-client";
import { buildApiUrl } from "./api-base";

export function isAuthError(error: unknown): boolean {
  const status = (error as any)?.response?.status;
  if (status === 401 || status === 403) return true;

  const message = String((error as any)?.message || "").toLowerCase();
  return (
    message.includes("no active refresh session") ||
    message.includes("unauthorized") ||
    message.includes("token refresh failed")
  );
}

function extractErrorMessage(value: unknown): string | undefined {
  if (value == null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const collected = value
      .map(extractErrorMessage)
      .filter((msg): msg is string => Boolean(msg));
    return collected.length ? collected.join(", ") : undefined;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (record.errors && Array.isArray(record.errors)) {
      const errs = record.errors.map(e => `${e.path}: ${e.message}`).join(', ');
      if (errs) return `Validation failed: ${errs}`;
    }

    for (const key of ["message", "error", "detail", "title", "reason"]) {
      const nested = extractErrorMessage(record[key]);
      if (nested && nested !== "Validation failed") return nested;
    }

    const values = Object.values(record)
      .map(extractErrorMessage)
      .filter((msg): msg is string => Boolean(msg));
    if (values.length) return values[0];

    try {
      return JSON.stringify(record);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export async function fetchWithAuth<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Add CSRF Token for mutating methods
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (typeof document !== 'undefined') {
      const isProd = window.location.protocol === 'https:';
      const cookiePrefix = isProd ? '__Host-' : '';
      
      const readCookie = (name: string) => {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : null;
      };
      
      const csrfToken = readCookie(`${cookiePrefix}csrf_token`) ?? readCookie('csrf_token');
      if (csrfToken && !headers.has('X-CSRF-Token')) {
        headers.set('X-CSRF-Token', csrfToken);
      }
    }
  }

  // Handle URL formation + params
  const params = (options as any).params;
  const fullUrl = buildApiUrl(url, params);

  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: options.credentials ?? 'include',
  });

  // Handle 401 Unauthorized with Refresh Token rotation
  if (response.status === 401 && !url.includes('/auth/refresh')) {
    try {
      await authClient.refreshAccessToken();
      // Re-issue the request, the browser will attach the new HttpOnly cookie
      response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: options.credentials ?? 'include',
      });
    } catch {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-failed'));
      }
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => ({})) : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      extractErrorMessage(data?.message) ||
      extractErrorMessage(data?.error) ||
      extractErrorMessage(data) ||
      `API Error: ${response.status}`;

    const error: any = new Error(message);
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: response.headers,
    };
    error.config = { url, method: options.method };
    throw error;
  }

  return data;
}

/**
 * Lightweight native fetch wrapper that emulates the http client interface
 * used throughout the application, allowing us to remove the 30KB http client dependency.
 */
export const api = {
  get: async <T = any>(url: string, options?: any): Promise<{ data: T }> => {
    const data = await fetchWithAuth(url, { ...options, method: 'GET' });
    return { data };
  },
  post: async <T = any>(url: string, body?: any, options?: any): Promise<{ data: T }> => {
    const data = await fetchWithAuth(url, { ...options, method: 'POST', body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined });
    return { data };
  },
  put: async <T = any>(url: string, body?: any, options?: any): Promise<{ data: T }> => {
    const data = await fetchWithAuth(url, { ...options, method: 'PUT', body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined });
    return { data };
  },
  patch: async <T = any>(url: string, body?: any, options?: any): Promise<{ data: T }> => {
    const data = await fetchWithAuth(url, { ...options, method: 'PATCH', body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined });
    return { data };
  },
  delete: async <T = any>(url: string, options?: any): Promise<{ data: T }> => {
    const data = await fetchWithAuth(url, { ...options, method: 'DELETE' });
    return { data };
  },
  // emulating http client.create for consistency if needed elsewhere
  create: (config: any) => api,
  defaults: {
    headers: {
      common: {} as any
    }
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

export default api;
