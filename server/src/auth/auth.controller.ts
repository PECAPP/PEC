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
} from '@nestjs/common';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { RateLimit } from '../common/decorators/rate-limit-options.decorator';
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
import type {
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
  private readonly refreshCookieName =
    process.env.REFRESH_COOKIE_NAME ?? 'refresh_token';

  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @RateLimit({
    limit: 8,
    windowMs: 60_000,
    banAfterExceeded: 4,
    banDurationMs: 60 * 60_000,
    requireCaptchaAfterExceeded: 2,
  })
  async signIn(
    @Body(new ZodValidationPipe(signInSchema)) signInDto: SignInInput,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
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

    const { refresh_token, ...response } = auth;
    return response;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @RateLimit({
    limit: 5,
    windowMs: 60_000,
    banAfterExceeded: 4,
    banDurationMs: 45 * 60_000,
    requireCaptchaAfterExceeded: 2,
  })
  async signUp(
    @Body(new ZodValidationPipe(signUpSchema)) signUpDto: SignUpInput,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
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
    const { refresh_token, ...response } = auth;
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @RateLimit({
    limit: 20,
    windowMs: 60_000,
    banAfterExceeded: 6,
    banDurationMs: 60 * 60_000,
    requireCaptchaAfterExceeded: 3,
  })
  async refresh(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
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
    const { refresh_token, ...response } = auth;
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken =
      body.refreshToken || this.extractRefreshTokenFromCookie(req);
    await this.authService.logout(refreshToken);
    this.clearRefreshCookie(res);
    return { loggedOut: true };
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) body: VerifyEmailInput,
  ) {
    return this.authService.verifyEmail(body.token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  @RateLimit({
    limit: 6,
    windowMs: 60_000,
    banAfterExceeded: 4,
    banDurationMs: 45 * 60_000,
    requireCaptchaAfterExceeded: 2,
  })
  async requestPasswordReset(
    @Body(new ZodValidationPipe(requestPasswordResetSchema))
    body: RequestPasswordResetInput,
  ) {
    return this.authService.requestPasswordReset(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
  ) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator')
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator')
  @Post('complete-profile')
  completeProfile(@Request() req: any, @Body() body: Record<string, any>) {
    return this.authService.completeProfile(req.user.sub, body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('student', 'faculty', 'college_admin', 'admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Request() req: any,
    @Body(new ZodValidationPipe(changePasswordSchema))
    body: ChangePasswordInput,
    @Res({ passthrough: true }) res: ExpressResponse,
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @RateLimit({ limit: 20, windowMs: 60_000, banAfterExceeded: 8 })
  async setRole(
    @Request() req: any,
    @Body(new ZodValidationPipe(setRoleSchema)) body: SetRoleInput,
  ) {
    return this.authService.setRole(req.user.sub, body?.role);
  }

  private extractRefreshTokenFromCookie(
    req: ExpressRequest,
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

  private setRefreshCookie(
    res: ExpressResponse,
    token: string,
    refreshExpiresAt: string,
  ): void {
    const expires = new Date(refreshExpiresAt);
    res.cookie(this.refreshCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      expires,
    });
  }

  private clearRefreshCookie(res: ExpressResponse): void {
    res.clearCookie(this.refreshCookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
    });
  }

  private getIp(req: ExpressRequest): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip ?? req.socket?.remoteAddress ?? null;
  }

  private getUserAgent(req: ExpressRequest): string | null {
    const ua = req.headers['user-agent'];
    if (Array.isArray(ua)) {
      return ua[0] ?? null;
    }
    return ua ?? null;
  }
}
