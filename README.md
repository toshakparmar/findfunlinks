# FinalLinks 🌐

> **Your Curated Hub for Movies, TV Shows, OTT Platforms, Anime Streaming, and More.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-v2.4-EF4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

FinalLinks is an enterprise-grade curated entertainment directory featuring automated mirror discovery and real-time uptime health telemetry. Engineered as a high-performance monorepo using **Turborepo** and **pnpm workspaces**, it enforces strict architectural boundaries, contract-first API design, and a responsive pixel-faithful design across desktop, tablet, and mobile (down to 320px).

---

## 📑 Table of Contents

- [Monorepo Structure](#-monorepo-structure)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Local Development Setup](#-local-development-setup)
- [Service Ports & Default Credentials](#-service-ports--default-credentials)
- [Build & Verification Commands](#-build--verification-commands)
- [Production Deployment Guide](#-production-deployment-guide)
  - [1. Deploy Backend API on Render](#1-deploy-backend-api-on-render)
  - [2. Deploy Public Web App on Vercel](#2-deploy-public-web-app-on-vercel)
  - [3. Deploy Admin Console on Vercel](#3-deploy-admin-console-on-vercel)
- [Security & Architecture](#-security--architecture)
- [License](#-license)

---

## 🏛 Monorepo Structure

```
finallinks/
├── apps/
│   ├── web/             # Public Directory Website (Next.js 15, App Router, Tailwind, Framer Motion)
│   ├── admin/           # Unified Super Admin & Owner Console (Next.js 15, Radix UI, TanStack Table, RBAC)
│   └── api/             # Core Backend API (NestJS 11, Fastify, Prisma ORM 6, Redis 7, BullMQ)
├── packages/
│   ├── contracts/       # Single source of truth: Zod schemas, TypeScript types, DTOs & enums
│   ├── ui/              # Shared UI design system: Logo, CircularLoader, MirrorChip, StarButton, etc.
│   ├── api-client/      # Isomorphic type-safe HTTP client wrapping @finallinks/contracts
│   └── config/          # Shared ESLint, Prettier, TypeScript, and Tailwind configurations
├── infra/
│   ├── docker/          # Docker Compose configurations (PostgreSQL 17, Redis 7, Mailpit)
│   └── nginx/           # Reverse proxy, SSL/TLS termination, and security headers
└── docs/                # Architecture specifications, runbooks, and design decisions
```

---

## ✨ Key Features

1. **Curated Multi-Category Directory**:
   - 18 core categories including OTT Platforms, Movies, TV Shows, Anime Streaming, Sports, Live TV, Music, Games, Software, Tools, Documentaries, Educational, Ebooks, Comics, Podcasts, Theatre, Kids & Family, and Others.
   - Dual theme: Pixel-faithful dark navy client theme (`#050A18`, `#0A1226`, `#2563EB`) and high-contrast light theme (`#F8FAFC`, `#FFFFFF`, `#0F172A`).
2. **Automated Domain & Mirror Monitoring**:
   - BullMQ background workers run latency and HTTP status checks every 5 minutes.
   - Visitors are dynamically routed to verified, low-latency live mirror links.
3. **Interactive Centered Website Details Modal**:
   - Center modal with smooth open/close animations showcasing website logos, short descriptions, highlight bullet points, live mirror status (with response latency in milliseconds), and direct visit actions.
4. **Instant Search & Command Palette**:
   - Global search (`Ctrl+K` or `/`) with live indexing across website names, categories, and tags, opening the detail modal directly on selection.
5. **Unified Admin & Owner Management Console**:
   - Role-Based Access Control (RBAC): Super Admin manages categories, tags, registrations, audit logs, and directory rankings; Website Owners manage their own live domains, backup mirrors, and metadata.
   - Interactive Drag & Drop / Up-Down ranking sequence editor.
6. **Mobile Optimization**:
   - Responsive layouts tested down to 320px narrow screens (touch-friendly targets, compact badges, and fluid typography).
7. **Official Brand Logo Fallback**:
   - Missing favicons or failed images automatically fall back to the official FinalLinks brand mark icon.

---

## 🛠 Tech Stack

- **Monorepo Tools:** [Turborepo](https://turbo.build/), [pnpm](https://pnpm.io/)
- **Frontend Applications:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 3.4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion), [Lucide React](https://lucide.dev/)
- **Backend API:** [NestJS 11](https://nestjs.com/) on [Fastify](https://fastify.dev/), [Prisma ORM 6](https://www.prisma.io/)
- **Database & Queue:** [PostgreSQL 17](https://www.postgresql.org/), [Redis 7](https://redis.io/), [BullMQ](https://bullmq.io/)
- **Validation & Contracts:** [Zod 3.24](https://zod.dev/)
- **Testing:** [Playwright](https://playwright.dev/) for E2E tests, [Vitest](https://vitest.dev/) for unit and contract tests

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

### 4. Configure Environment Files

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

### 5. Run Database Migrations and Seed

```bash
# Push Prisma schema and seed database
pnpm --filter @finallinks/api prisma migrate dev
pnpm --filter @finallinks/api prisma db seed
```

### 6. Start Development Servers

Run all applications in parallel using Turborepo:

```bash
pnpm dev
```

---

## 🌐 Service Ports & Default Credentials

| Service               | Port   | Local URL                                      | Notes / Credentials                                    |
| :-------------------- | :----- | :--------------------------------------------- | :----------------------------------------------------- |
| **Public Web App**    | `3000` | [http://localhost:3000](http://localhost:3000) | Public directory                                       |
| **Admin Console**     | `3001` | [http://localhost:3001](http://localhost:3001) | Super Admin: `admin@finallinks.com` / `SuperAdmin123!` |
| **Backend REST API**  | `4000` | [http://localhost:4000](http://localhost:4000) | Swagger documentation at `/docs`                       |
| **Mailpit (Webmail)** | `8025` | [http://localhost:8025](http://localhost:8025) | Local email inbox for verification emails              |
| **PostgreSQL 17**     | `5432` | `localhost:5432`                               | `postgres` / `postgres` (Database: `finallinks`)       |
| **Redis 7**           | `6379` | `localhost:6379`                               | Key-value store & background queue                     |

---

## 💻 Build & Verification Commands

```bash
# Run TypeScript compilation checks across all workspaces
pnpm typecheck

# Build all packages and applications for production
pnpm build

# Typecheck specific apps
pnpm --filter @finallinks/web typecheck
pnpm --filter @finallinks/admin typecheck
pnpm --filter @finallinks/api typecheck

# Run unit tests
pnpm test

# Format codebase with Prettier
pnpm format
```

---

## ☁️ Production Deployment Guide

### 1. Deploy Backend API on Render

Render is ideal for deploying the NestJS backend and managing PostgreSQL and Redis.

#### A. Set Up Database & Redis

1. On [Render Dashboard](https://dashboard.render.com/), create a new **PostgreSQL** database:
   - Name: `finallinks-db`
   - Copy the **Internal Database URL** (or External if hosting outside Render).
2. Create a new **Redis** instance:
   - Name: `finallinks-redis`
   - Copy the **Internal Redis URL**.

#### B. Create Render Web Service for NestJS API

1. Click **New +** -> **Web Service** -> Connect your GitHub repo (`findfunlinks`).
2. Configure settings:
   - **Name:** `finallinks-api`
   - **Language / Environment:** `Node`
   - **Branch:** `main`
   - **Root Directory:** _(leave blank / repository root)_
   - **Build Command:**
     ```bash
     pnpm install && pnpm --filter @finallinks/contracts build && pnpm --filter @finallinks/api build && pnpm --filter @finallinks/api prisma migrate deploy
     ```
   - **Start Command:**
     ```bash
     pnpm --filter @finallinks/api start:prod
     ```
3. Set the Environment Variables on Render:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=postgresql://user:password@hostname:5432/finallinks-db
   REDIS_URL=redis://hostname:6379
   JWT_SECRET=your-secure-random-jwt-secret-string-at-least-32-chars
   JWT_REFRESH_SECRET=your-secure-random-jwt-refresh-secret-string
   FRONTEND_URL=https://your-web-app.vercel.app
   ADMIN_URL=https://your-admin-app.vercel.app
   SMTP_HOST=smtp.sendgrid.net (or your provider)
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-smtp-api-key
   SMTP_FROM=no-reply@finallinks.com
   ```
4. Click **Create Web Service**. Your API will be live at `https://finallinks-api.onrender.com` (Swagger at `/docs`).

---

### 2. Deploy Public Web App on Vercel

The main directory website (`apps/web`) is built with Next.js 15 and deploys to Vercel with zero friction.

1. Go to [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"**.
2. Select your `findfunlinks` repository.
3. Configure the Project:
   - **Project Name:** `finallinks-web`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click "Edit" and choose `apps/web`
   - **Include files outside the Root Directory:** Ensure this is checked **Yes** (required for monorepo packages).
4. Build & Development Settings:
   - **Build Command:** `pnpm --filter @finallinks/web build`
   - **Install Command:** `pnpm install`
   - **Output Directory:** `.next`
5. Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://finallinks-api.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-web-domain.vercel.app
   ```
6. Click **Deploy**.

---

### 3. Deploy Admin Console on Vercel

The Admin & Owner management portal (`apps/admin`) is also a Next.js 15 application.

1. In Vercel, click **"Add New Project"** again and select the same `findfunlinks` repository.
2. Configure the Project:
   - **Project Name:** `finallinks-admin`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click "Edit" and choose `apps/admin`
   - **Include files outside the Root Directory:** Ensure this is checked **Yes**.
3. Build & Development Settings:
   - **Build Command:** `pnpm --filter @finallinks/admin build`
   - **Install Command:** `pnpm install`
   - **Output Directory:** `.next`
4. Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://finallinks-api.onrender.com
   NEXT_PUBLIC_ADMIN_URL=https://your-admin-domain.vercel.app
   NEXT_PUBLIC_PUBLIC_WEB_URL=https://your-web-domain.vercel.app
   ```
5. Click **Deploy**.

---

## 🔒 Security & Defense-in-Depth

- **Authentication:** Dual-token JWT (short-lived access tokens + rotating HTTP-only refresh cookies) with Argon2id password hashing.
- **Contract Enforcement:** End-to-end Zod contract validation on both client and server inputs.
- **Rate Limiting:** Sliding-window rate limiting on public search, feedback, and submission endpoints.
- **Security Headers:** Comprehensive Content Security Policy (CSP), HSTS, X-Frame-Options, and X-Content-Type-Options headers.

---

## 📄 License

Proprietary and confidential. All rights reserved © 2026 FinalLinks.
