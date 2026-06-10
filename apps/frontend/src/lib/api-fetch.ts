import { cookies } from 'next/headers';
import { resolveInternalApiBaseUrl } from '@/lib/internal-api-url';

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value ?? '';
}

export async function apiFetch(method: string, path: string, body?: object) {
  const API = resolveInternalApiBaseUrl();
  const token = await getToken();
  
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  
  const data = res.ok ? await res.json().catch(() => null) : null;
  return { ok: res.ok, status: res.status, data };
}
