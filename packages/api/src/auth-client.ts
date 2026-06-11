/**
 * Secure Auth Client with HttpOnly Sessions & Next.js BFF proxy
 * Handles secure cookie-based authentication. No tokens are exposed to JS.
 */

import { buildApiUrl } from './api-base';

const authUrl = (route: string) => buildApiUrl(`/auth/${route}`);

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'faculty' | 'college_admin';
}

export interface AuthResponse {
  user: {
    uid: string;
    email: string;
    fullName: string;
    role: string | null;
    roles?: string[];
    avatar: string | null;
    verified: boolean;
    profileComplete: boolean;
  };
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

class AuthClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  private get isProd(): boolean {
    return typeof window !== 'undefined'
      ? window.location.protocol === 'https:'
      : false;
  }

  private get cookiePrefix(): string {
    return this.isProd ? '__Host-' : '';
  }

  private readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  private getCsrfToken(): string | null {
    // Try prefixed name first, fall back to unprefixed for dev
    return this.readCookie(`${this.cookiePrefix}csrf_token`) ?? this.readCookie('csrf_token');
  }

  private hasRefreshSession(): boolean {
    // Check for the presence of the refresh session cookie
    return (
      this.readCookie(`${this.cookiePrefix}refresh_session`) !== null ||
      this.readCookie('refresh_session') !== null
    );
  }

  private waitForRefresh(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.refreshSubscribers.push({ resolve, reject });
    });
  }

  private notifyRefreshSubscribers(): void {
    this.refreshSubscribers.forEach(({ resolve }) => resolve());
    this.refreshSubscribers = [];
  }

  private notifyRefreshSubscribersError(error: Error): void {
    this.refreshSubscribers.forEach(({ reject }) => reject(error));
    this.refreshSubscribers = [];
  }

  private async parseErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
      const body = await response.json();
      if (body && typeof body.message === 'string') {
        return body.message;
      }
      if (Array.isArray(body?.message) && body.message.length > 0) {
        return String(body.message[0]);
      }
      if (Array.isArray(body?.errors) && body.errors.length > 0) {
        const first = body.errors[0];
        if (first && typeof first.message === 'string') {
          return first.message;
        }
      }
    } catch {
      // Response body may be empty or non-JSON.
    }

    return fallback;
  }

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const csrfToken = this.getCsrfToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const response = await fetch(authUrl('login'), {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const message = await this.parseErrorMessage(response, 'Login failed');
      throw new Error(message);
    }

    return response.json();
  }

  async signup(credentials: SignUpCredentials): Promise<AuthResponse & { emailVerificationToken?: string }> {
    const csrfToken = this.getCsrfToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const response = await fetch(authUrl('register'), {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      const message = await this.parseErrorMessage(response, 'Signup failed');
      throw new Error(message);
    }

    return response.json();
  }

  async refreshAccessToken(): Promise<void> {
    if (this.isRefreshing) {
      return this.waitForRefresh();
    }

    if (!this.hasRefreshSession()) {
      throw new Error('No active refresh session');
    }

    this.isRefreshing = true;

    try {
      const csrfToken = this.getCsrfToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      const response = await fetch(authUrl('refresh'), {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          const message = await this.parseErrorMessage(response, 'No active refresh session');
          throw new Error(message);
        }

        const message = await this.parseErrorMessage(response, 'Token refresh failed');
        throw new Error(message);
      }

      this.notifyRefreshSubscribers();
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('Token refresh failed');
      this.notifyRefreshSubscribersError(normalizedError);
      throw normalizedError;
    } finally {
      this.isRefreshing = false;
    }
  }

  async logout(): Promise<void> {
    try {
      const csrfToken = this.getCsrfToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      await fetch(authUrl('logout'), {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        credentials: 'include',
      });
    } catch {
      // Log to service but don't fail logout
    }
  }

  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    const response = await fetch(authUrl('verify-email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    });

    if (!response.ok) {
      const message = await this.parseErrorMessage(response, 'Email verification failed');
      throw new Error(message);
    }

    return response.json();
  }

  async requestPasswordReset(email: string): Promise<{ accepted: boolean }> {
    const response = await fetch(authUrl('request-password-reset'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    if (!response.ok) {
      const message = await this.parseErrorMessage(response, 'Password reset request failed');
      throw new Error(message);
    }

    return response.json();
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<{ reset: boolean }> {
    const response = await fetch(authUrl('reset-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const message = await this.parseErrorMessage(response, 'Password reset failed');
      throw new Error(message);
    }

    return response.json();
  }

  async changePassword(payload: ChangePasswordPayload): Promise<{ changed: boolean }> {
    const csrfToken = this.getCsrfToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const response = await fetch(authUrl('change-password'), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const message = await this.parseErrorMessage(response, 'Password change failed');
      throw new Error(message);
    }

    return response.json();
  }

  async fetchPermissions(): Promise<any[]> {
    const response = await fetch(authUrl('me/permissions'), {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.permissions || [];
  }


}

export const authClient: AuthClient =
  typeof window !== 'undefined'
    ? new AuthClient()
    : (new Proxy({} as AuthClient, {
        get(_, prop) {
          return () => {
            throw new Error(
              `[AuthClient] Attempted to call ${String(prop)} on the server. ` +
              'Use a request-scoped AuthClient instance in SSR/RSC contexts.'
            );
          };
        },
      }) as AuthClient);

export function createAuthClient(): AuthClient {
  return new AuthClient();
}
