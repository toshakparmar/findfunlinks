import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class OwnerScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    // Super Admin has global bypass capability
    if (user.role?.type === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Identify target websiteId or domainId from params
    const websiteId = request.params.websiteId || request.params.id;
    const domainId = request.params.domainId;

    if (domainId) {
      const domain = await this.prisma.domain.findUnique({
        where: { id: domainId },
        include: { website: true },
      });
      if (!domain) {
        throw new NotFoundException('Domain not found');
      }
      if (domain.website.ownerId !== user.id) {
        throw new ForbiddenException(
          'Access denied: You do not own the website associated with this domain',
        );
      }
      return true;
    }

    if (websiteId) {
      const website = await this.prisma.website.findUnique({
        where: { id: websiteId },
      });
      if (!website) {
        throw new NotFoundException('Website not found');
      }
      if (website.ownerId !== user.id) {
        throw new ForbiddenException('Access denied: You do not own this website');
      }
      return true;
    }

    // If route is under /owner/website without explicit ID, attach user's single website to request
    const userWebsite = await this.prisma.website.findUnique({
      where: { ownerId: user.id },
    });
    request.userWebsite = userWebsite;

    return true;
  }
}
