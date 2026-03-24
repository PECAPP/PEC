/**
 * Secure Auth Client with Refresh Token Rotation, Session Management & RBAC
 * Handles secure cookie + header-based token delivery for web + mobile clients
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  private refreshSubscribers: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  private clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private waitForRefresh(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.refreshSubscribers.push({ resolve, reject });
    });
  }

  private notifyRefreshSubscribers(token: string): void {
    this.refreshSubscribers.forEach(({ resolve }) => resolve(token));
    this.refreshSubscribers = [];
  }

  private notifyRefreshSubscribersError(error: Error): void {
    this.refreshSubscribers.forEach(({ reject }) => reject(error));
    this.refreshSubscribers = [];
  }

  private async parseErrorMessage(
    response: Response,
    fallback: string,
  ): Promise<string> {
    try {
      const body = await response.json();
      if (body && typeof body.message === "string") {
        return body.message;
      }
    } catch {
      // Response body may be empty or non-JSON.
    }

    return fallback;
  }

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const message = await this.parseErrorMessage(response, "Login failed");
      throw new Error(message);
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
      const message = await this.parseErrorMessage(response, "Signup failed");
      throw new Error(message);
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
      return this.waitForRefresh();
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 403
        ) {
          this.clearSession();
          const message = await this.parseErrorMessage(
            response,
            "No active refresh session",
          );
          throw new Error(message);
        }

        const message = await this.parseErrorMessage(
          response,
          "Token refresh failed",
        );
        throw new Error(message);
      }

      const data: AuthResponse = await response.json();
      this.accessToken = data.access_token;

      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }

      this.notifyRefreshSubscribers(this.accessToken);
      return this.accessToken;
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error("Token refresh failed");
      this.clearSession();
      this.notifyRefreshSubscribersError(normalizedError);
      throw normalizedError;
    } finally {
      this.isRefreshing = false;
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
      this.clearSession();
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
      const message = await this.parseErrorMessage(
        response,
        "Email verification failed",
      );
      throw new Error(message);
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
      const message = await this.parseErrorMessage(
        response,
        "Password reset request failed",
      );
      throw new Error(message);
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
      const message = await this.parseErrorMessage(
        response,
        "Password reset failed",
      );
      throw new Error(message);
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
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearSession();
      }
      const message = await this.parseErrorMessage(
        response,
        "Password change failed",
      );
      throw new Error(message);
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

  resetSession(): void {
    this.clearSession();
  }
}

export const authClient = new AuthClient();
