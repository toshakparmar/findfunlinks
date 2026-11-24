import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  LoginSchema,
  LoginInput,
  AcceptInviteSchema,
  AcceptInviteInput,
  ForgotPasswordSchema,
  ForgotPasswordInput,
  ResetPasswordSchema,
  ResetPasswordInput,
  ChangePasswordSchema,
  ChangePasswordInput,
  UserProfile,
} from '@finallinks/contracts';

const REFRESH_COOKIE_NAME = 'refresh_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function parseDurationToMs(duration?: string, defaultMs = 24 * 60 * 60 * 1000): number {
  if (!duration) return defaultMs;
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match || !match[1] || !match[2]) return defaultMs;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return val * 1000;
    case 'm':
      return val * 60 * 1000;
    case 'h':
      return val * 60 * 60 * 1000;
    case 'd':
      return val * 24 * 60 * 60 * 1000;
    default:
      return defaultMs;
  }
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  private setAuthCookies(res: Response, refreshToken: string, accessToken: string) {
    this.setRefreshCookie(res, refreshToken);
    const accessMaxAge = parseDurationToMs(
      process.env.JWT_EXPIRES_IN,
      24 * 60 * 60 * 1000, // default 1 day session
    );
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: accessMaxAge,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email, password, and optional TOTP' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(
    @Body() body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const validated = LoginSchema.parse(body);
    const result = await this.authService.login(validated, req);
    this.setAuthCookies(res, result.refreshToken, result.accessToken);
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and retrieve new access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyToken?: string,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] || bodyToken;
    const result = await this.authService.refreshTokens(token, req);
    this.setAuthCookies(res, result.refreshToken, result.accessToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out current session and revoke refresh token' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyToken?: string,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] || bodyToken;
    this.clearRefreshCookie(res);
    return this.authService.logout(token);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions across all devices' })
  async logoutAll(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    this.clearRefreshCookie(res);
    return this.authService.logoutAll(userId);
  }

  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invitation and set password' })
  async acceptInvite(@Body() body: AcceptInviteInput) {
    const validated = AcceptInviteSchema.parse(body);
    const result = await this.authService.acceptInvite(validated);
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  async forgotPassword(@Body() body: ForgotPasswordInput) {
    const validated = ForgotPasswordSchema.parse(body);
    return this.authService.forgotPassword(validated);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with expiring reset token' })
  async resetPassword(@Body() body: ResetPasswordInput) {
    const validated = ResetPasswordSchema.parse(body);
    return this.authService.resetPassword(validated);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and permissions' })
  async getMe(@CurrentUser('id') userId: string): Promise<UserProfile> {
    return this.authService.getMe(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for authenticated user' })
  async changePassword(@CurrentUser('id') userId: string, @Body() body: ChangePasswordInput) {
    const validated = ChangePasswordSchema.parse(body);
    return this.authService.changePassword(userId, validated);
  }
}
