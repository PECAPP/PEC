import { authClient } from "./auth-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authClient.getAccessToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Handle URL formation
  let fullUrl = url;
  if (!url.startsWith('http')) {
    fullUrl = `${apiBaseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  // Emulate Axios URL params if present
  const params = (options as any).params;
  if (params && typeof params === 'object') {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });
    const connector = fullUrl.includes('?') ? '&' : '?';
    fullUrl += `${connector}${query.toString()}`;
  }

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
    const error: any = new Error(data?.message || data?.error || `API Error: ${response.status}`);
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
