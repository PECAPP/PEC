/**
 * Secure Auth Client with Refresh Token Rotation, Session Management & RBAC
 * Handles secure cookie + header-based token delivery for web + mobile clients
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  role?:
    | "student"
    | "faculty"
    | "college_admin"
    | "admin"
    | "moderator"
    | "user";
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  refresh_expires_at?: string;
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
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private subscribeToRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private notifyRefreshSubscribers(token: string): void {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data: AuthResponse = await response.json();
    this.accessToken = data.access_token;

    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }

    return data;
  }

  async signup(
    credentials: SignUpCredentials,
  ): Promise<AuthResponse & { emailVerificationToken?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    const data = await response.json();
    this.accessToken = data.access_token;

    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }

    return data;
  }

  async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.subscribeToRefresh((token) => resolve(token));
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        throw new Error("Token refresh failed");
      }

      const data: AuthResponse = await response.json();
      this.accessToken = data.access_token;

      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }

      this.isRefreshing = false;
      this.notifyRefreshSubscribers(this.accessToken);
      return this.accessToken;
    } catch (error) {
      this.isRefreshing = false;
      this.logout();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const body = this.refreshToken
        ? JSON.stringify({ refreshToken: this.refreshToken })
        : JSON.stringify({});

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        credentials: "include",
      });
    } catch {
      // Log to service but don't fail logout
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Email verification failed");
    }

    return response.json();
  }

  async requestPasswordReset(email: string): Promise<{ accepted: boolean }> {
    const response = await fetch(
      `${API_BASE_URL}/auth/request-password-reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Password reset request failed");
    }

    return response.json();
  }

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<{ reset: boolean }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Password reset failed");
    }

    return response.json();
  }

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ changed: boolean }> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      const error = await response.json();
      throw new Error(error.message || "Password change failed");
    }

    return response.json();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }
}

export const authClient = new AuthClient();
