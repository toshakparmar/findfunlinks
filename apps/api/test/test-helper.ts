import { PrismaService } from '../src/prisma/prisma.service';
import { RoleType, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

export async function ensureTestData(prisma: PrismaService) {
  // 1. Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: { isSystem: true, type: RoleType.SUPER_ADMIN },
    create: {
      name: 'Super Admin',
      description: 'Platform Super Administrator with all permissions',
      isSystem: true,
      type: RoleType.SUPER_ADMIN,
    },
  });

  const ownerRole = await prisma.role.upsert({
    where: { name: 'Website Owner' },
    update: { isSystem: true, type: RoleType.WEBSITE_OWNER },
    create: {
      name: 'Website Owner',
      description: 'Approved website owner managing their website and domains',
      isSystem: true,
      type: RoleType.WEBSITE_OWNER,
    },
  });

  // 2. Super Admin User
  const adminPasswordHash = await argon2.hash('SuperAdminSecretPass123!');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@findfunlinks.com' },
    update: {
      passwordHash: adminPasswordHash,
      roleId: superAdminRole.id,
      status: UserStatus.ACTIVE,
      failedLoginCount: 0,
      lockedUntil: null,
    },
    create: {
      email: 'admin@findfunlinks.com',
      name: 'Platform Super Admin',
      passwordHash: adminPasswordHash,
      status: UserStatus.ACTIVE,
      roleId: superAdminRole.id,
      mustChangePassword: false,
    },
  });

  // 3. Ensure starter Categories exist
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    const defaultCategories = [
      { name: 'OTT Platforms', slug: 'ott-platforms', description: 'OTT Streaming', icon: 'Play' },
      { name: 'Movies', slug: 'movies', description: 'Movie databases', icon: 'Film' },
      { name: 'TV Shows', slug: 'tv-shows', description: 'TV Series', icon: 'Tv' },
      {
        name: 'Anime Streaming',
        slug: 'anime-streaming',
        description: 'Anime streams',
        icon: 'Tv',
      },
      { name: 'Software', slug: 'software', description: 'Software tools', icon: 'Cpu' },
    ];
    let order = 1;
    for (const c of defaultCategories) {
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: { isActive: true },
        create: { ...c, sortOrder: order++, isActive: true },
      });
    }
  }

  // 4. Ensure starter Tags exist
  const tagCount = await prisma.tag.count();
  if (tagCount === 0) {
    const defaultTags = [
      { name: 'Free', slug: 'free' },
      { name: 'No Ads', slug: 'no-ads' },
      { name: 'Fast CDN', slug: 'fast-cdn' },
    ];
    for (const t of defaultTags) {
      await prisma.tag.upsert({
        where: { slug: t.slug },
        update: {},
        create: t,
      });
    }
  }

  return { superAdminRole, ownerRole, superAdmin };
}
