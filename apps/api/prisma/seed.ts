import {
  PrismaClient,
  RoleType,
  UserStatus,
  WebsiteStatus,
  ContentRating,
  DomainType,
  DomainStatus,
} from '@prisma/client';
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

  // 3.5. Clean Database of legacy websites, domains, tokens, and users
  console.log('🧹 Clearing legacy database records (websites, domains, tokens, old users)...');
  await prisma.domainCheck.deleteMany({});
  await prisma.domain.deleteMany({});
  await prisma.websiteTag.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.registrationRequest.deleteMany({});
  await prisma.website.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});

  // 4. Seed Initial Super Admin User
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@finallinks.com';
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

  // 7. Seed Demo Website Owner User
  const ownerEmail = process.env.DEMO_OWNER_EMAIL || 'owner@finallinks.com';
  const ownerPassword = process.env.DEMO_OWNER_PASSWORD || 'OwnerSecurePassword2026!';
  console.log(`👉 Seeding Demo Owner user (${ownerEmail})...`);

  const ownerPasswordHash = await argon2.hash(ownerPassword);
  await prisma.user.upsert({
    where: { email: ownerEmail.toLowerCase() },
    update: {
      passwordHash: ownerPasswordHash,
      roleId: ownerRole.id,
      status: UserStatus.ACTIVE,
      failedLoginCount: 0,
      lockedUntil: null,
      deletedAt: null,
    },
    create: {
      email: ownerEmail.toLowerCase(),
      name: 'Verified Website Owner',
      passwordHash: ownerPasswordHash,
      status: UserStatus.ACTIVE,
      roleId: ownerRole.id,
      mustChangePassword: false,
    },
  });

  // 8. Seed 20 Demo Websites across Categories
  console.log('👉 Seeding 20 demo websites with showcase data and varied mirrors...');
  const allCategories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  const allTags = await prisma.tag.findMany();

  const websiteTemplates = [
    {
      slug: 'funlinks-showcase',
      name: 'FunLinks Showcase Portal',
      shortDescription: 'Premier curated directory for anime, games, and entertainment mirrors.',
      highlights: [
        'Automated 5-minute health telemetry',
        'Zero tracking or middleman redirects',
        'Direct connection to ultra-fast mirrors',
        'Community verified domain ownership',
      ],
      note: 'Notice: Mirror latency is re-checked every 5 minutes across 6 global edge nodes.',
      catSlug: 'anime-streaming',
      starCount: 642,
      domainCount: 6,
    },
    {
      slug: 'stream-matrix',
      name: 'Stream Matrix Hub',
      shortDescription: 'Global resilient mirror network with 150+ edge unblocked proxies and CDN relays.',
      highlights: [
        '150+ active global mirrors & proxies',
        'Anycast CDN acceleration',
        'Instant fallback routing when domains drop',
        'Encrypted HTTPS everywhere',
        'Clean, ad-free directory presentation',
      ],
      note: 'High-availability cluster: automatically selects the nearest edge server.',
      catSlug: 'anime-streaming',
      starCount: 1250,
      domainCount: 150, // Test virtualization and unlimited domains!
    },
    {
      slug: 'cinema-vault',
      name: 'Cinema Vault Online',
      shortDescription: 'Archive of public-domain classics, indie festivals, and remastered cinema.',
      highlights: [
        'Master quality 4K and 1080p remaster streams',
        'Multi-language soft subtitles in 20+ languages',
        'Lossless FLAC audio tracks',
        'Exhaustive metadata and director notes',
      ],
      note: 'Subtitles are community-translated and peer-reviewed.',
      catSlug: 'movies',
      starCount: 890,
      domainCount: 8,
    },
    {
      slug: 'retro-arcade-zone',
      name: 'Retro Arcade Zone',
      shortDescription: 'Browser-playable retro gaming portal with cloud save synchronization.',
      highlights: [
        'Over 3,000 classic games ready in-browser',
        'Gamepad and Bluetooth controller support',
        'Cloud save slots linked to user profiles',
        'Zero install or plugins required',
      ],
      note: 'Optimized for Chrome, Firefox, and mobile Safari.',
      catSlug: 'games',
      starCount: 730,
      domainCount: 5,
    },
    {
      slug: 'open-source-haven',
      name: 'Open Source Haven',
      shortDescription: 'Curated index of high-quality open-source desktop software and developer tools.',
      highlights: [
        'Strictly FOSS licensed applications',
        'SHA256 checksums verified for all releases',
        'Direct binary downloads without bundleware',
        'Cross-platform Windows, Mac, and Linux',
      ],
      note: 'Mirrors are synced hourly with upstream GitHub releases.',
      catSlug: 'software',
      starCount: 940,
      domainCount: 7,
    },
    {
      slug: 'sound-sphere',
      name: 'Sound Sphere Audio',
      shortDescription: 'Independent lossless audio streaming and creator music discovery.',
      highlights: [
        'Hi-Res 24-bit/96kHz lossless streaming',
        'Direct artist support and tip integration',
        'Zero audio compression or volume flattening',
        'Offline caching enabled',
      ],
      note: 'Works offline via Progressive Web App technology.',
      catSlug: 'music',
      starCount: 512,
      domainCount: 4,
    },
    {
      slug: 'docu-world',
      name: 'DocuWorld Streaming',
      shortDescription: 'Nature, science, and history documentaries curated from global creators.',
      highlights: [
        'Full 4K HDR nature cinematics',
        'Original commentary and interactive transcripts',
        'Curated by scientific educators',
        'Ad-free learning experience',
      ],
      note: 'Educational licenses available for schools and libraries.',
      catSlug: 'documentaries',
      starCount: 460,
      domainCount: 4,
    },
    {
      slug: 'manga-nexus',
      name: 'Manga Nexus Reader',
      shortDescription: 'Fast, responsive manga reader with high-res scans and continuous vertical scroll.',
      highlights: [
        'Continuous webtoon and vertical reading mode',
        'High-density image compression with sharp text',
        'Instant chapter prefetching',
        'Customizable color themes for AMOLED screens',
      ],
      note: 'Double-tap to zoom is fully supported on mobile devices.',
      catSlug: 'comics',
      starCount: 810,
      domainCount: 9,
    },
    {
      slug: 'podcast-station',
      name: 'Podcast Station Live',
      shortDescription: 'Aggregated directory of tech, business, and storytelling audio shows.',
      highlights: [
        'Searchable audio transcripts with timestamp jumping',
        'Variable speed playback 0.5x to 3.0x',
        'Silence skipping and voice boost audio engine',
        'RSS feed auto-detection',
      ],
      note: 'No sign-up required to stream or download episodes.',
      catSlug: 'podcasts',
      starCount: 380,
      domainCount: 3,
    },
    {
      slug: 'dev-toolbox-pro',
      name: 'Dev Toolbox Pro',
      shortDescription: 'Essential in-browser utilities for developers: formatters, converters, and regex testers.',
      highlights: [
        '100% client-side privacy: no data leaves your browser',
        'JSON, YAML, GraphQL, and SQL formatters',
        'JWT decoder, Base64 converter, hash generators',
        'Works completely offline',
      ],
      note: 'Security certified: zero telemetry collected on input payloads.',
      catSlug: 'tools',
      starCount: 1120,
      domainCount: 5,
    },
    {
      slug: 'indie-games-radar',
      name: 'Indie Games Radar',
      shortDescription: 'Showcase of hidden gems, experimental prototypes, and indie game demos.',
      highlights: [
        'Developer interviews and devlog updates',
        'Playable web builds and direct demo mirrors',
        'Categorized by mechanics and game engines',
        'Community voting and feedback',
      ],
      note: 'Direct links to itch.io and Steam developer pages.',
      catSlug: 'games',
      starCount: 490,
      domainCount: 3,
    },
    {
      slug: 'anime-pulse',
      name: 'Anime Pulse Central',
      shortDescription: 'Seasonal anime broadcasting schedule, release tracker, and discussion links.',
      highlights: [
        'Live airtime countdowns adjusted to user timezone',
        'Simulcast stream links and backup mirrors',
        'Episode release notifications',
        'Spoiler-free synopsis and staff credits',
      ],
      note: 'Timezones update automatically based on device locale.',
      catSlug: 'anime-streaming',
      starCount: 680,
      domainCount: 6,
    },
    {
      slug: 'classic-lit-library',
      name: 'Classic Lit E-Library',
      shortDescription: 'Over 70,000 free public domain ebooks formatted for modern e-readers and web.',
      highlights: [
        'Available in EPUB, Kindle MOBI, and responsive Web Reader',
        'Beautiful bespoke cover art and typography',
        'Annotated footnotes and author biographies',
        'Free forever with zero ads',
      ],
      note: 'EPUB files are strictly validated against IDPF standards.',
      catSlug: 'ebooks',
      starCount: 580,
      domainCount: 4,
    },
    {
      slug: 'live-sports-wire',
      name: 'Live Sports Wire',
      shortDescription: 'Real-time scores, verified legal broadcast schedules, and match replay mirrors.',
      highlights: [
        'Sub-second live score updates across soccer, basketball, F1',
        'Official broadcast provider links by country',
        'Extended tactical highlight packages',
        'Clean layout with minimal bandwidth overhead',
      ],
      note: 'Scores stream via low-latency WebSockets.',
      catSlug: 'sports',
      starCount: 770,
      domainCount: 7,
    },
    {
      slug: 'ambient-chillout',
      name: 'Ambient Chillout Radio',
      shortDescription: 'Curated 24/7 lo-fi, synthwave, and generative ambient streams for focus and study.',
      highlights: [
        'Continuous commercial-free generative audio',
        'Built-in Pomodoro productivity timer',
        'Dynamic soundscapes: rain, thunder, cafe noise',
        'Ultra-low battery and CPU usage',
      ],
      note: 'Designed to run quietly in background browser tabs.',
      catSlug: 'music',
      starCount: 840,
      domainCount: 4,
    },
    {
      slug: 'theatre-arts-hub',
      name: 'Theatre & Arts Hub',
      shortDescription: 'Archived stage plays, Shakespeare productions, and performing arts recordings.',
      highlights: [
        'Full multicam recordings of historic theatre',
        'Accompanying scripts and study guides',
        'Exclusive backstage and actor retrospectives',
        'High quality stereo and 5.1 surround sound',
      ],
      note: 'Archived under educational fair-use preservation licenses.',
      catSlug: 'theatre',
      starCount: 320,
      domainCount: 3,
    },
    {
      slug: 'kids-learn-zone',
      name: 'Kids Learning Adventures',
      shortDescription: 'Safe, age-appropriate educational games, animations, and interactive storybooks.',
      highlights: [
        'COPPA compliant: zero ads, zero data tracking',
        'Interactive math and phonics minigames',
        'Parental dashboard with time limit controls',
        'Vibrant, colorful animation by certified educators',
      ],
      note: 'Approved for early childhood and elementary classrooms.',
      catSlug: 'kids-family',
      starCount: 410,
      domainCount: 3,
    },
    {
      slug: 'tv-archive-project',
      name: 'TV Archive Project',
      shortDescription: 'Classic television broadcasts, retro commercials, and nostalgic television specials.',
      highlights: [
        'Uncut broadcast master quality with original bumpers',
        'Searchable by original air date and decade',
        'Comprehensive commercial archives from the 80s & 90s',
        'High fidelity CRT shader filter optional',
      ],
      note: 'CRT filter can be toggled on/off in player controls.',
      catSlug: 'tv-shows',
      starCount: 620,
      domainCount: 5,
    },
    {
      slug: 'live-stream-directory',
      name: 'Live Stream Directory',
      shortDescription: 'Global public webcam streams, space agency views, and wildlife sanctuary feeds.',
      highlights: [
        'NASA ISS Earth orbit live feeds',
        'African watering hole wildlife cameras',
        'Tokyo, New York, and London 4K city cams',
        'Low-latency HLS with automatic quality switching',
      ],
      note: 'Streams are verified for continuous 24/7 uptime.',
      catSlug: 'live-tv',
      starCount: 710,
      domainCount: 4,
    },
    {
      slug: 'open-learn-academy',
      name: 'Open Learn Academy',
      shortDescription: 'Free university-level computer science, mathematics, and philosophy video courses.',
      highlights: [
        'Complete course lecture recordings and syllabi',
        'Practice problem sets with step-by-step solutions',
        'Peer discussion study groups',
        'Self-paced learning with progress tracking',
      ],
      note: 'All course materials are licensed under Creative Commons.',
      catSlug: 'educational',
      starCount: 960,
      domainCount: 5,
    },
  ];

  for (let idx = 0; idx < websiteTemplates.length; idx++) {
    const t = websiteTemplates[idx]!;
    const category =
      allCategories.find((c) => c.slug === t.catSlug) || allCategories[idx % allCategories.length]!;

    // Create unique owner user for each website
    const ownerEmail = `owner-${t.slug}@finallinks.com`;
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {
        roleId: ownerRole.id,
        status: UserStatus.ACTIVE,
      },
      create: {
        email: ownerEmail,
        name: `Owner of ${t.name}`,
        passwordHash: ownerPasswordHash,
        status: UserStatus.ACTIVE,
        roleId: ownerRole.id,
      },
    });

    const website = await prisma.website.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        shortDescription: t.shortDescription,
        highlights: t.highlights,
        note: t.note,
        starCount: t.starCount,
        stars: t.starCount,
        sortOrder: idx + 1,
        categoryId: category.id,
        ownerId: owner.id,
        status: WebsiteStatus.ACTIVE,
      },
      create: {
        slug: t.slug,
        name: t.name,
        tagline: t.shortDescription,
        shortDescription: t.shortDescription,
        description: `## About ${t.name}\n\n${t.shortDescription}\n\n### Key Features\n${t.highlights.map((h) => `- ${h}`).join('\n')}\n\n${t.note}`,
        highlights: t.highlights,
        note: t.note,
        starCount: t.starCount,
        stars: t.starCount,
        sortOrder: idx + 1,
        contentRating: ContentRating.ALL,
        status: WebsiteStatus.ACTIVE,
        ownerId: owner.id,
        categoryId: category.id,
        isFeatured: idx < 4,
        logoUrl: `https://images.unsplash.com/photo-${1570000000000 + idx * 123456}?w=128&auto=format&fit=crop`,
      },
    });

    // Seed sample screenshots for detail gallery
    await prisma.websiteScreenshot.deleteMany({ where: { websiteId: website.id } });
    await prisma.websiteScreenshot.createMany({
      data: [
        {
          websiteId: website.id,
          url: `https://picsum.photos/seed/${t.slug}-1/1280/720`,
          thumbnailUrl: `https://picsum.photos/seed/${t.slug}-1/480/270`,
          altText: `${t.name} Dashboard view`,
          sortOrder: 0,
        },
        {
          websiteId: website.id,
          url: `https://picsum.photos/seed/${t.slug}-2/1280/720`,
          thumbnailUrl: `https://picsum.photos/seed/${t.slug}-2/480/270`,
          altText: `${t.name} Content reader preview`,
          sortOrder: 1,
        },
        {
          websiteId: website.id,
          url: `https://picsum.photos/seed/${t.slug}-3/1280/720`,
          thumbnailUrl: `https://picsum.photos/seed/${t.slug}-3/480/270`,
          altText: `${t.name} Mirror selection interface`,
          sortOrder: 2,
        },
      ],
    });

    // Seed mirror domains
    await prisma.domain.deleteMany({ where: { websiteId: website.id } });
    const domainData: Array<{
      hostname: string;
      url: string;
      label: string;
      type: DomainType;
      status: DomainStatus;
      lastResponseMs: number;
      sortOrder: number;
      isPublic: boolean;
      websiteId: string;
    }> = [];

    // Primary domain
    domainData.push({
      hostname: `${t.slug}.com`,
      url: `https://${t.slug}.com`,
      label: 'Official Primary',
      type: DomainType.PRIMARY,
      status: DomainStatus.ACTIVE,
      lastResponseMs: 95 + (idx % 50),
      sortOrder: 0,
      isPublic: true,
      websiteId: website.id,
    });

    // Additional mirrors
    const tldList = ['org', 'net', 'io', 'to', 'ws', 'is', 'me', 'bz', 'ch', 'gg'];
    const countToGenerate = t.domainCount || 3;

    for (let dIdx = 1; dIdx < countToGenerate; dIdx++) {
      const tld = tldList[dIdx % tldList.length];
      const mirrorType = dIdx % 4 === 0 ? DomainType.PROXY : DomainType.MIRROR;
      const isDown = dIdx === 3 && countToGenerate > 5;
      domainData.push({
        hostname: `mirror-${dIdx}.${t.slug}.${tld}`,
        url: `https://mirror-${dIdx}.${t.slug}.${tld}`,
        label: dIdx % 2 === 0 ? `Fast CDN #${dIdx}` : `Backup Edge #${dIdx}`,
        type: mirrorType,
        status: isDown ? DomainStatus.DOWN : DomainStatus.ACTIVE,
        lastResponseMs: isDown ? 9999 : 80 + ((dIdx * 17) % 180),
        sortOrder: dIdx,
        isPublic: true,
        websiteId: website.id,
      });
    }

    // Insert domains in batch
    await prisma.domain.createMany({ data: domainData });

    // Link random tags
    if (allTags.length > 0) {
      await prisma.websiteTag.deleteMany({ where: { websiteId: website.id } });
      const tag1 = allTags[idx % allTags.length]!;
      const tag2 = allTags[(idx + 2) % allTags.length]!;
      await prisma.websiteTag.createMany({
        data: [
          { websiteId: website.id, tagId: tag1.id },
          { websiteId: website.id, tagId: tag2.id },
        ],
        skipDuplicates: true,
      });
    }
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
