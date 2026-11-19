# FindFunLinks 🌐
> **Your Hub for Movies, Shows, OTT, Anime and More.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-v2.4-EF4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io/)

FindFunLinks is an enterprise-grade curated entertainment directory featuring automated mirror discovery and real-time uptime health monitoring. Engineered as a high-performance monorepo using **Turborepo** and **pnpm workspaces**, it enforces strict architectural boundaries, contract-first API design, and a responsive pixel-faithful design across desktop, tablet, and mobile (down to 320px).

---

## 📑 Table of Contents
- [Monorepo Structure](#-monorepo-structure)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Service Ports & Seed Credentials](#-service-ports--seed-credentials)
- [Development & Build Commands](#-development--build-commands)
- [Vercel Deployment Guide (Web App)](#-vercel-deployment-guide-web-app)
- [Security & Architecture](#-security--architecture)

---

## 🏛 Monorepo Structure

```
findfunlinks/
├── apps/
│   ├── web/             # Public Directory Website (Next.js 15, App Router, Tailwind, Framer Motion)
│   ├── admin/           # Super Admin Console (Next.js 15, Radix UI, TanStack Table, RBAC)
│   ├── owner/           # Website Owner Portal (Next.js 15, Domain/Mirror Management)
│   └── api/             # Core Backend API (NestJS 11, Fastify, Prisma ORM, Redis 7, BullMQ)
├── packages/
│   ├── contracts/       # Single source of truth: Zod schemas, TypeScript types, DTOs & enums
│   ├── ui/              # Shared UI design tokens, brand SVG logos, buttons, drawers & badges
│   ├── api-client/      # Isomorphic type-safe HTTP client wrapping @findfunlinks/contracts
│   └── config/          # Shared ESLint, Prettier, TypeScript, and Tailwind presets
├── infra/
│   ├── docker/          # Docker Compose configurations (PostgreSQL 17, Redis 7, Mailpit)
│   └── nginx/           # Production reverse proxy, SSL/TLS, and security headers
└── docs/                # Architecture, design decisions (ADRs), runbooks, and security specs
```

---

## ✨ Key Features

1. **Curated Multi-Category Directory**:
   - 18 core categories including OTT Platforms, Movies, TV Shows, Anime Streaming, Sports, Live TV, Music, Games, Software, Tools, Documentaries, Educational, Ebooks, Comics, Podcasts, Theatre, Kids & Family, and Others.
   - Dual theme: Pixel-faithful dark navy client theme (`#050A18`, `#0A1226`, `#2563EB`) and high-contrast light theme (`#FFFFFF`, `#F1F5F9`, `#0B1220`).
2. **Automated Domain & Mirror Monitoring**:
   - Automated BullMQ background workers run latency and HTTP status checks every 5 minutes.
   - Users are dynamically routed to verified, low-latency live mirror links.
3. **Interactive Domain Drawer**:
   - Click any site row to open a slide-over drawer displaying all backup mirrors, official domains, response times, SSL status, and quick-copy/visit actions.
4. **Website Owner Program**:
   - Self-service portal (`apps/owner`) for verified website owners to register domains, add backup mirrors, and maintain directory listings.
5. **Super Admin Operations Console**:
   - Comprehensive dashboard (`apps/admin`) with role-based access control (RBAC) to approve registrations, manage categories, moderate links, and trigger crawlers.
6. **Mobile Optimization**:
   - Custom-engineered responsive layouts tested down to 320px narrow mobile screens (no overlapping text, clean grid-based segmented controls, and accessible touch targets).

---

## 🛠 Tech Stack

- **Monorepo Tools:** [Turborepo](https://turbo.build/), [pnpm](https://pnpm.io/)
- **Frontend Applications:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 3.4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion), [Lucide React](https://lucide.dev/)
- **Backend API:** [NestJS 11](https://nestjs.com/) on [Fastify](https://fastify.dev/), [Prisma ORM 6](https://www.prisma.io/)
- **Database & Queue:** [PostgreSQL 17](https://www.postgresql.org/), [Redis 7](https://redis.io/), [BullMQ](https://bullmq.io/)
- **Data Validation & Contracts:** [Zod 3.24](https://zod.dev/)
- **Testing:** [Playwright](https://playwright.dev/) for end-to-end testing, [Vitest](https://vitest.dev/) for unit and contract tests

---

## 📋 Prerequisites

Before starting, ensure you have the following installed locally:
- **Node.js** >= `20.18.0` (LTS recommended)
- **pnpm** >= `9.x` or `10.x` (`npm install -g pnpm`)
- **Docker & Docker Compose** (for PostgreSQL, Redis, and Mailpit)
- **Git**

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/toshakparmar/findfunlinks.git
cd findfunlinks
```

### 2. Install Workspace Dependencies
```bash
pnpm install
```

### 3. Start Backing Infrastructure (Docker)
Launch PostgreSQL, Redis, and Mailpit:
```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

### 4. Configure Environment Variables
Copy the example environment files:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp apps/owner/.env.example apps/owner/.env.local
```

### 5. Run Database Migrations and Seed
```bash
# Push Prisma schema and seed initial categories and administrative accounts
pnpm --filter @findfunlinks/api prisma migrate dev
pnpm --filter @findfunlinks/api prisma db seed
```

### 6. Start Development Servers
Run all applications in parallel using Turborepo:
```bash
pnpm dev
```

---

## 🌐 Service Ports & Seed Credentials

| Service | Port | URL | Default Credentials |
| :--- | :--- | :--- | :--- |
| **Public Web App** | `3000` | [http://localhost:3000](http://localhost:3000) | Public access |
| **Super Admin Console** | `3001` | [http://localhost:3001](http://localhost:3001) | `admin@findfunlinks.com` / `Admin@123456` |
| **Website Owner Portal** | `3002` | [http://localhost:3002](http://localhost:3002) | Owner email verification magic link |
| **Backend REST API** | `4000` | [http://localhost:4000](http://localhost:4000) | Swagger docs at `/docs` |
| **Mailpit (Local Email)** | `8025` | [http://localhost:8025](http://localhost:8025) | Webmail viewer for test verification emails |
| **PostgreSQL 17** | `5432` | `localhost:5432` | `postgres` / `postgres` (DB: `findfunlinks`) |
| **Redis 7** | `6379` | `localhost:6379` | Default connection |

---

## 💻 Development & Build Commands

```bash
# Run typechecking across the entire monorepo
pnpm typecheck

# Build all applications and packages
pnpm build

# Build only the web app
pnpm --filter @findfunlinks/web build

# Run unit and contract tests
pnpm test

# Run Playwright E2E verification
pnpm --filter @findfunlinks/web test:e2e

# Format codebase with Prettier
pnpm format
```

---

## ☁️ Vercel Deployment Guide (Web App)

The public directory website (`apps/web`) is optimized for seamless deployment to **Vercel**.

### Step 1: Connect GitHub Repository on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"**.
2. Select the `findfunlinks` repository from GitHub.

### Step 2: Configure Project Settings
In the Vercel project configuration screen:
* **Framework Preset:** `Next.js`
* **Root Directory:** Click "Edit" and choose `apps/web`
* **Include files outside the Root Directory:** Check the box **"Yes"** (Vercel automatically detects the Turborepo workspace).

### Step 3: Configure Build & Development Settings
If Vercel does not auto-detect the monorepo root command, specify:
* **Build Command:** `pnpm --filter @findfunlinks/web build` (or leave default if Turborepo is detected)
* **Install Command:** `pnpm install`
* **Output Directory:** `.next`

### Step 4: Set Environment Variables
Add the following environment variables in Vercel project settings:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 5: Deploy
Click **"Deploy"**. Vercel will build the workspace packages (`@findfunlinks/ui`, `@findfunlinks/contracts`, `@findfunlinks/api-client`) and deploy `apps/web` with global Edge CDN caching and Server-Side Rendering.

---

## 🔒 Security & Defense-in-Depth

- **Authentication:** Dual-token JWT (short-lived access token + rotating HTTP-only refresh cookies) with Argon2id password hashing.
- **Contract Enforcement:** End-to-end Zod contract validation on both client and server inputs.
- **Bot & Abuse Mitigation:** In-memory + Redis sliding-window rate limiting on all public search and submission endpoints.
- **CSP & Headers:** Comprehensive Content Security Policy (CSP), HSTS, X-Frame-Options (`DENY`), and Referrer-Policy headers.

---

## 📄 License

This project is proprietary and confidential. All rights reserved © 2026 FindFunLinks.
