import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          process.env.JWT_ACCESS_SECRET ||
          'super_secret_access_key_min_32_characters_random_findfunlinks',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException('User account no longer exists');
      }

      if (user.status === 'SUSPENDED') {
        throw new UnauthorizedException('User account has been suspended');
      }

      // Format role permissions into string array
      const permissions = user.role.permissions.map((rp) => rp.permission.key);

      (request as unknown as { user: unknown }).user = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        twoFactorEnabled: user.twoFactorEnabled,
        role: {
          id: user.role.id,
          name: user.role.name,
          type: user.role.type,
          permissions,
        },
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }
    return undefined;
  }
}
