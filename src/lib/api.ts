import { authClient } from "./auth-client";
import { buildApiUrl } from "./api-base";

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

    for (const key of ["message", "error", "detail", "title", "reason"]) {
      const nested = extractErrorMessage(record[key]);
      if (nested) return nested;
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

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authClient.getAccessToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Handle URL formation + params
  const params = (options as any).params;
  const fullUrl = buildApiUrl(url, params);

  let response = await fetch(fullUrl, { ...options, headers });

  // Handle 401 Unauthorized with Refresh Token rotation
  if (response.status === 401 && !url.includes('/auth/refresh')) {
    try {
      const newToken = await authClient.refreshAccessToken();
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(fullUrl, { ...options, headers });
    } catch (e) {
      window.dispatchEvent(new CustomEvent("auth-failed"));
      throw e;
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
 * Lightweight native fetch wrapper that emulates the Axios interface
 * used throughout the application, allowing us to remove the 30KB Axios dependency.
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
  // emulating axios.create for consistency if needed elsewhere
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
