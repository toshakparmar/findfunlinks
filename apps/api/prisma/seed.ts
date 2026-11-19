import { PrismaClient, RoleType, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  // Dashboard
  { key: 'dashboard.view', module: 'dashboard', description: 'View dashboard analytics' },

  // Registrations
  { key: 'registration.view', module: 'registration', description: 'View website registrations' },
  {
    key: 'registration.review',
    module: 'registration',
    description: 'Review registration requests',
  },
  {
    key: 'registration.approve',
    module: 'registration',
    description: 'Approve registrations and create owners',
  },
  {
    key: 'registration.reject',
    module: 'registration',
    description: 'Reject registration requests',
  },
  {
    key: 'registration.delete',
    module: 'registration',
    description: 'Delete registration submissions',
  },

  // Users
  { key: 'user.view', module: 'user', description: 'View users list and profiles' },
  { key: 'user.create', module: 'user', description: 'Create internal user accounts' },
  { key: 'user.update', module: 'user', description: 'Update user profiles' },
  { key: 'user.suspend', module: 'user', description: 'Suspend or reactivate users' },
  { key: 'user.delete', module: 'user', description: 'Soft delete user accounts' },
  { key: 'user.resetPassword', module: 'user', description: 'Force password reset' },

  // Roles & Permissions
  { key: 'role.view', module: 'role', description: 'View roles and permission matrices' },
  { key: 'role.create', module: 'role', description: 'Create custom roles' },
  { key: 'role.update', module: 'role', description: 'Update custom roles and assignments' },
  { key: 'role.delete', module: 'role', description: 'Delete custom roles' },

  // Websites
  { key: 'website.view', module: 'website', description: 'View website listings' },
  { key: 'website.create', module: 'website', description: 'Create website directory entry' },
  { key: 'website.update', module: 'website', description: 'Update website metadata and status' },
  { key: 'website.suspend', module: 'website', description: 'Suspend website visibility' },
  { key: 'website.delete', module: 'website', description: 'Soft-delete website records' },
  { key: 'website.feature', module: 'website', description: 'Toggle featured status' },

  // Domains & Mirrors
  { key: 'domain.view', module: 'domain', description: 'View mirror domains' },
  { key: 'domain.create', module: 'domain', description: 'Add new domain or mirror' },
  { key: 'domain.update', module: 'domain', description: 'Update domain settings' },
  { key: 'domain.delete', module: 'domain', description: 'Remove domain from website' },
  { key: 'domain.check', module: 'domain', description: 'Trigger on-demand health check' },
  { key: 'domain.block', module: 'domain', description: 'Block abusive domain globally' },

  // Categories & Tags
  { key: 'category.view', module: 'category', description: 'View directory categories' },
  { key: 'category.create', module: 'category', description: 'Create category' },
  { key: 'category.update', module: 'category', description: 'Update category' },
  { key: 'category.delete', module: 'category', description: 'Delete category' },
  { key: 'tag.view', module: 'tag', description: 'View directory tags' },
  { key: 'tag.create', module: 'tag', description: 'Create tag' },
  { key: 'tag.update', module: 'tag', description: 'Update tag' },
  { key: 'tag.delete', module: 'tag', description: 'Delete tag' },

  // Operations
  { key: 'report.view', module: 'report', description: 'View user reports queue' },
  { key: 'report.handle', module: 'report', description: 'Resolve or dismiss reports' },
  { key: 'page.view', module: 'page', description: 'View CMS pages' },
  { key: 'page.update', module: 'page', description: 'Edit CMS pages' },
  { key: 'setting.view', module: 'setting', description: 'View platform settings' },
  { key: 'setting.update', module: 'setting', description: 'Update system settings' },
  { key: 'audit.view', module: 'audit', description: 'View audit logs' },
  { key: 'audit.export', module: 'audit', description: 'Export audit logs' },
  { key: 'email.view', module: 'email', description: 'View email logs' },
  { key: 'email.resend', module: 'email', description: 'Resend failed emails' },
];

const OWNER_PERMISSION_KEYS = [
  'dashboard.view',
  'website.view',
  'website.update',
  'domain.view',
  'domain.create',
  'domain.update',
  'domain.delete',
  'domain.check',
];

const STARTER_CATEGORIES = [
  {
    name: 'Anime & Pop Culture',
    slug: 'anime-pop-culture',
    description: 'Anime directories, comic readers, media hubs, and ACG culture.',
    icon: 'Film',
  },
  {
    name: 'Gaming & Web Toys',
    slug: 'gaming-web-toys',
    description: 'Browser games, interactive toys, simulations, and retro games.',
    icon: 'Gamepad2',
  },
  {
    name: 'Developer & Tech Fun',
    slug: 'developer-tech-fun',
    description: 'Coding playgrounds, generative tech experiments, and dev curiosities.',
    icon: 'Terminal',
  },
  {
    name: 'Creative & Art Tools',
    slug: 'creative-art-tools',
    description: 'Audio visualizers, pixel art generators, and generative graphics.',
    icon: 'Palette',
  },
  {
    name: 'Productivity & Utilities',
    slug: 'productivity-utilities',
    description: 'Smart micro-tools, format converters, and web enhancers.',
    icon: 'Sparkles',
  },
  {
    name: 'Community & Discussion',
    slug: 'community-discussion',
    description: 'Forums, imageboards, discovery hubs, and niche subcultures.',
    icon: 'Users',
  },
];

const STARTER_TAGS = [
  { name: 'Free', slug: 'free' },
  { name: 'No Ads', slug: 'no-ads' },
  { name: 'Open Source', slug: 'open-source' },
  { name: 'PWA', slug: 'pwa' },
  { name: 'Multi-Mirror', slug: 'multi-mirror' },
  { name: 'Interactive', slug: 'interactive' },
  { name: 'Fast CDN', slug: 'fast-cdn' },
  { name: 'Retro', slug: 'retro' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Permissions
  console.log('👉 Seeding permissions...');
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { module: perm.module, description: perm.description },
      create: perm,
    });
  }
  const allPermRecords = await prisma.permission.findMany();
  const permMap = new Map(allPermRecords.map((p) => [p.key, p.id]));

  // 2. Seed Super Admin Role
  console.log('👉 Seeding Super Admin role...');
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

  // Assign all permissions to Super Admin role
  for (const perm of allPermRecords) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 3. Seed Website Owner Role
  console.log('👉 Seeding Website Owner role...');
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

  for (const key of OWNER_PERMISSION_KEYS) {
    const permId = permMap.get(key);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: ownerRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: ownerRole.id,
          permissionId: permId,
        },
      });
    }
  }

  // 4. Seed Initial Super Admin User
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@findfunlinks.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminSecretPass123!';
  console.log(`👉 Seeding Super Admin user (${adminEmail})...`);

  const passwordHash = await argon2.hash(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      passwordHash,
      roleId: superAdminRole.id,
      status: UserStatus.ACTIVE,
      failedLoginCount: 0,
      lockedUntil: null,
      deletedAt: null,
    },
    create: {
      email: adminEmail.toLowerCase(),
      name: 'Platform Super Admin',
      passwordHash,
      status: UserStatus.ACTIVE,
      roleId: superAdminRole.id,
      mustChangePassword: false,
    },
  });

  // 5. Seed Starter Categories
  console.log('👉 Seeding categories...');
  let order = 0;
  for (const cat of STARTER_CATEGORIES) {
    order++;
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, sortOrder: order },
      create: { ...cat, sortOrder: order, isActive: true },
    });
  }

  // 6. Seed Starter Tags
  console.log('👉 Seeding tags...');
  for (const tag of STARTER_TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
