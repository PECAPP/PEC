import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Res,
  BadRequestException,
  Delete,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { PoliciesGuard } from './guards/policies.guard';
import { CheckPolicies } from './decorators/check-policies.decorator';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  setRoleSchema,
  signInSchema,
  signUpSchema,
  refreshSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './dto/auth.schemas';
import {
  ChangePasswordInput,
  RefreshInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  SetRoleInput,
  SignInInput,
  SignUpInput,
  VerifyEmailInput,
} from './dto/auth.schemas';

@Controller('auth')
export class AuthController {
  private readonly isProd = process.env.NODE_ENV === 'production';
  private readonly cookiePrefix = this.isProd ? '__Host-' : '';
  private readonly refreshCookieName = `${this.cookiePrefix}${process.env.REFRESH_COOKIE_NAME ?? 'refresh_token'}`;

  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async signIn(
    @Body(new ZodValidationPipe(signInSchema)) signInDto: SignInInput,
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const auth = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
      {
        ipAddress: this.getIp(req),
        userAgent: this.getUserAgent(req),
      },
    );
    this.setRefreshCookie(res, auth.refresh_token, auth.refresh_expires_at);
    this.setAccessTokenCookie(res, auth.access_token);
    const csrfToken = this.setCsrfCookie(res, req);
    this.setIdentityCookies(res, { uid: auth.user.uid, role: auth.user.role || 'student' });

    const { refresh_token, ...response } = auth;
    return { ...response, csrfToken };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) signUpDto: SignUpInput,
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const auth = await this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.name,
      signUpDto.role || 'student',
      {
        ipAddress: this.getIp(req),
        userAgent: this.getUserAgent(req),
      },
    );

    this.setRefreshCookie(res, auth.refresh_token, auth.refresh_expires_at);
    this.setAccessTokenCookie(res, auth.access_token);
    const csrfToken = this.setCsrfCookie(res, req);
    this.setIdentityCookies(res, { uid: auth.user.uid, role: auth.user.role || 'student' });
    const { refresh_token, ...response } = auth;
    return { ...response, csrfToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async refresh(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput,
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    this.verifyCsrf(req);

    const refreshToken =
      body.refreshToken || this.extractRefreshTokenFromCookie(req);
    if (!refreshToken) {
      throw new BadRequestException('Refresh token required');
    }

    const auth = await this.authService.refreshSession(refreshToken, {
      ipAddress: this.getIp(req),
      userAgent: this.getUserAgent(req),
    });

    this.setRefreshCookie(res, auth.refresh_token, auth.refresh_expires_at);
    this.setAccessTokenCookie(res, auth.access_token);
    const csrfToken = this.setCsrfCookie(res, req);
    this.setIdentityCookies(res, { uid: auth.user.uid, role: auth.user.role || 'student' });
    const { refresh_token, ...response } = auth;
    return { ...response, csrfToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async logout(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput,
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    this.verifyCsrf(req);

    const refreshToken =
      body.refreshToken || this.extractRefreshTokenFromCookie(req);
    const accessToken = this.extractAccessToken(req);
    await this.authService.logout(refreshToken, accessToken);
    this.clearRefreshCookie(res);
    res.clearCookie(`${this.cookiePrefix}csrf_token`, { path: '/' });
    return { loggedOut: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) body: VerifyEmailInput,
  ) {
    return this.authService.verifyEmail(body.token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async requestPasswordReset(
    @Body(new ZodValidationPipe(requestPasswordResetSchema))
    body: RequestPasswordResetInput,
  ) {
    return this.authService.requestPasswordReset(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
  ) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('sessions')
  async getSessions(@Request() req: any) {
    const userId = req.user.sub;
    const sessions = await this.authService.getSessions(userId);
    return { sessions };
  }

  @UseGuards(AuthGuard)
  @Delete('sessions/:id')
  async revokeSession(@Param('id') sessionId: string, @Request() req: any) {
    const userId = req.user.sub;
    await this.authService.revokeSession(userId, sessionId);
    return { revoked: true };
  }

  @UseGuards(AuthGuard)
  @Get('me/permissions')
  getPermissions(@Request() req: any) {
    return { permissions: req.user.permissions || [] };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('complete-profile')
  completeProfile(@Request() req: any, @Body() body: Record<string, any>) {
    return this.authService.completeProfile(req.user.sub, body);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async changePassword(
    @Request() req: any,
    @Body(new ZodValidationPipe(changePasswordSchema))
    body: ChangePasswordInput,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.changePassword(
      req.user.sub,
      body.currentPassword,
      body.newPassword,
    );
    this.clearRefreshCookie(res);
    return result;
  }

  @Post('set-role')
  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can('manage', 'User'))
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async setRole(
    @Request() req: any,
    @Body(new ZodValidationPipe(setRoleSchema)) body: SetRoleInput,
  ) {
    return this.authService.setRole(req.user.sub, body?.role);
  }

  private extractRefreshTokenFromCookie(
    req: FastifyRequest,
  ): string | undefined {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }

    const entries = cookieHeader.split(';').map((chunk) => chunk.trim());
    const target = entries.find((item) =>
      item.startsWith(`${this.refreshCookieName}=`),
    );

    if (!target) {
      return undefined;
    }

    const token = target.slice(this.refreshCookieName.length + 1);
    return token ? decodeURIComponent(token) : undefined;
  }

  private extractAccessToken(req: FastifyRequest): string | undefined {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;
    const entries = cookieHeader.split(';').map((chunk) => chunk.trim());
    const target = entries.find((item) => item.startsWith(`${this.cookiePrefix}access_token=`));
    if (!target) return undefined;
    const token = target.slice(`${this.cookiePrefix}access_token=`.length);
    return token ? decodeURIComponent(token) : undefined;
  }

  private verifyCsrf(req: FastifyRequest): void {
    const csrfHeader = req.headers['x-csrf-token'];
    const cookieHeader = req.headers.cookie;
    let csrfCookie;
    if (cookieHeader) {
      const entries = cookieHeader.split(';').map((chunk) => chunk.trim());
      const target = entries.find((item) => item.startsWith(`${this.cookiePrefix}csrf_token=`));
      if (target) {
        csrfCookie = target.slice(`${this.cookiePrefix}csrf_token=`.length);
      }
    }
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      throw new ForbiddenException('CSRF Token Invalid');
    }
  }

  private setRefreshCookie(
    res: FastifyReply,
    token: string,
    refreshExpiresAt: string,
  ): void {
    const expires = new Date(refreshExpiresAt);
    res.setCookie(this.refreshCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires,
    });
    // Non-HttpOnly marker for client-side refresh heuristics.
    res.setCookie('refresh_present', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires,
    });
  }

  private setIdentityCookies(res: FastifyReply, user: { uid: string, role: string }): void {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    res.setCookie('user_id', user.uid, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', 
        expires 
    });
    res.setCookie('user_role', user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', 
        expires 
    });
  }

  private setAccessTokenCookie(res: FastifyReply, token: string): void {
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins to match JWT
    res.setCookie(`${this.cookiePrefix}access_token`, token, {
      httpOnly: true, // Secure against XSS
      secure: this.isProd,
      sameSite: 'strict',
      path: '/',
      expires,
    });
  }

  private setCsrfCookie(res: FastifyReply, req?: FastifyRequest): string {
    if (req) {
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const entries = cookieHeader.split(';').map((chunk) => chunk.trim());
        const target = entries.find((item) => item.startsWith(`${this.cookiePrefix}csrf_token=`));
        if (target) {
          const existingToken = target.slice(`${this.cookiePrefix}csrf_token=`.length);
          if (existingToken) return existingToken;
        }
      }
    }
    const crypto = require('crypto');
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.setCookie(`${this.cookiePrefix}csrf_token`, csrfToken, {
      httpOnly: true, // Secure against XSS
      secure: this.isProd,
      sameSite: 'strict',
      path: '/',
    });
    return csrfToken;
  }

  private clearRefreshCookie(res: FastifyReply): void {
    res.clearCookie(this.refreshCookieName, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'strict',
      path: '/',
    });
    res.clearCookie('refresh_present', {
      httpOnly: false,
      secure: this.isProd,
      sameSite: 'strict',
      path: '/',
    });
    res.clearCookie(`${this.cookiePrefix}access_token`, { path: '/' });
    res.clearCookie('user_id', { path: '/' });
    res.clearCookie('user_role', { path: '/' });
  }

  private getIp(req: FastifyRequest): string | null {
    return req.ip ?? req.socket?.remoteAddress ?? null;
  }

  private getUserAgent(req: FastifyRequest): string | null {
    const ua = req.headers['user-agent'];
    if (Array.isArray(ua)) {
      return ua[0] ?? null;
    }
    return ua ?? null;
  }
}
