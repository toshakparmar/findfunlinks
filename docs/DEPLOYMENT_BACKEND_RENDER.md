# FinalLinks — Backend Deployment Guide (Render & Supabase)

This guide walks you through deploying the **FinalLinks NestJS API (`apps/api`)** to **[Render.com](https://render.com)** as a production Web Service connected to **[Supabase](https://supabase.com)** (PostgreSQL & Storage).

---

## 1. Prerequisites Checklist

- A GitHub account with access to the `finallinks` repository.
- A free or paid account on **[Render.com](https://render.com)**.
- A free or paid account on **[Supabase.com](https://supabase.com)**.
- A transactional email provider (e.g., [Resend](https://resend.com), SendGrid, AWS SES, or custom SMTP).

---

## 2. Supabase Setup (Database & Storage)

### Step 2.1: Retrieve Database Connection Strings

1. In your Supabase Dashboard, select your project.
2. Go to **Project Settings** -> **Database**.
3. Under **Connection string**:
   - Select **URI** and choose **Transaction Mode** (Port `6543`). This is your `DATABASE_URL`.
     > Format: `postgresql://postgres.[REF]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - Select **URI** and choose **Session Mode** (Port `5432`). This is your `DIRECT_URL` (used by Prisma migrations).
     > Format: `postgresql://postgres.[REF]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`

### Step 2.2: Setup Supabase Storage Bucket

1. In Supabase Dashboard, navigate to **Storage** -> **New Bucket**.
2. Name the bucket: `finallinks-media`.
3. Toggle **Public bucket** to `ON` (allows visitors and browsers to view uploaded logos and screenshots).
4. Save the bucket.
5. In **Project Settings** -> **API**, copy:
   - **Project URL** (`SUPABASE_URL`)
   - **anon / public key** (`SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`)

---

## 3. Deploying on Render

You can deploy using either **Blueprint (1-Click)** or **Manual Web Service Setup**.

### Option A: 1-Click Deployment via Render Blueprint (Recommended)

1. Go to your **[Render Dashboard](https://dashboard.render.com)**.
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository `findfunlinks`.
4. Render will detect `render.yaml` automatically.
5. In the configuration screen, fill in your secret variables (`DATABASE_URL`, `DIRECT_URL`, `CORS_ORIGIN`, `SUPABASE_*`).
6. Click **Apply**. Render will trigger the build and deploy.

---

### Option B: Manual Web Service Setup

1. In **Render Dashboard**, click **New +** -> **Web Service**.
2. Select your repository `toshakparmar/findfunlinks`.
3. Configure the service settings:
   - **Name:** `finallinks-api`
   - **Region:** Choose closest to your Supabase region (e.g., `Oregon (US West)` or `Singapore`).
   - **Branch:** `main`
   - **Root Directory:** Leave **EMPTY / BLANK** (monorepo root).
     > ⚠️ **CRITICAL:** Do NOT set Root Directory to `apps/api/src` or `apps/api`. In a Turborepo monorepo, Render must execute from the repository root so it can resolve workspace packages and root lockfiles. If you already set Root Directory to `apps/api/src`, clear it and save settings!
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter @finallinks/config build && pnpm --filter @finallinks/contracts build && pnpm --filter @finallinks/api db:generate && pnpm --filter @finallinks/api db:migrate:deploy && pnpm --filter @finallinks/api build
     ```
   - **Start Command:**
     ```bash
     pnpm --filter @finallinks/api start:prod
     ```
     _(Alternatively: `node apps/api/dist/src/main.js` or `node apps/api/dist/main.js`)_
   - **Instance Type:** `Starter` ($7/mo recommended for production) or `Free`.
   - **Health Check Path:** `/api/v1/health`

---

## 4. Production Environment Variables Reference

In Render Dashboard -> **finallinks-api** -> **Environment**, add the following environment variables:

| Variable Name               | Required | Example / Description                                                                                                                   |
| :-------------------------- | :------: | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                  | **Yes**  | `production`                                                                                                                            |
| `PORT`                      | **Yes**  | `10000` (Render sets port automatically or defaults to 10000)                                                                           |
| `ENABLE_SWAGGER`            | Optional | `true` (enables interactive Swagger UI at `/docs`)                                                                                      |
| `DATABASE_URL`              | **Yes**  | Supabase Pooler URI (port 6543 with `?pgbouncer=true`)                                                                                  |
| `DIRECT_URL`                | **Yes**  | Supabase Session URI (port 5432)                                                                                                        |
| `JWT_ACCESS_SECRET`         | **Yes**  | Cryptographic random 32+ character string                                                                                               |
| `JWT_REFRESH_SECRET`        | **Yes**  | Cryptographic random 32+ character string                                                                                               |
| `JWT_EXPIRES_IN`            | Optional | `15m`                                                                                                                                   |
| `REFRESH_TOKEN_EXPIRES_IN`  | Optional | `7d`                                                                                                                                    |
| `CORS_ORIGIN`               | **Yes**  | Comma-separated frontend URLs: `https://finallinks.com,https://admin.finallinks.com,https://your-app.vercel.app` (No trailing slashes!) |
| `SUPABASE_URL`              | **Yes**  | `https://[PROJECT_REF].supabase.co`                                                                                                     |
| `SUPABASE_ANON_KEY`         | **Yes**  | Supabase anon key                                                                                                                       |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes**  | Supabase service_role key                                                                                                               |
| `SUPABASE_STORAGE_BUCKET`   | Optional | `finallinks-media`                                                                                                                      |
| `PUBLIC_WEB_URL`            | **Yes**  | Production Main Web URL (e.g., `https://finallinks.com` or Vercel URL)                                                                  |
| `ADMIN_PANEL_URL`           | **Yes**  | Production Admin Panel URL (e.g., `https://admin.finallinks.com` or Vercel URL)                                                         |
| `SMTP_HOST`                 | Optional | `smtp.gmail.com` (for Gmail) or custom SMTP                                                                                             |
| `SMTP_PORT`                 | Optional | `465` (SSL) or `587` (TLS)                                                                                                              |
| `SMTP_SECURE`               | Optional | `true` (for port 465) or `false` (for 587)                                                                                              |
| `SMTP_USER`                 | Optional | `finallinksreal@gmail.com`                                                                                                              |
| `SMTP_PASS`                 | Optional | Gmail App Password (e.g. `finallinks44AA@@`)                                                                                            |
| `MAIL_FROM`                 | Optional | `FinalLinks <finallinksreal@gmail.com>`                                                                                                 |
| `ALLOW_TEMP_PASSWORD_EMAIL` | Optional | `true`                                                                                                                                  |

> [!TIP]
> **Generating Secure JWT Secrets:**
> Run this command in any terminal:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 5. Post-Deployment Database Seeding

After your Render service deploys successfully, you can run the database seed command to insert the initial categories, tags, system settings, and default Super Admin account:

### Method 1: Using Render Shell

1. Go to your Render service -> **Shell** tab.
2. Run:
   ```bash
   node -r ts-node/register apps/api/prisma/seed.ts
   ```

### Method 2: From Local Machine

You can seed your production Supabase database from your local machine:

```bash
# In your local root directory
DATABASE_URL="your_supabase_pooler_url" DIRECT_URL="your_supabase_direct_url" pnpm --filter @finallinks/api db:seed
```

---

## 6. Verifying Deployment Health

Once the service displays **Live**:

1. **Health Check Probe:**
   Open: `https://[YOUR_RENDER_SERVICE_URL].onrender.com/api/v1/health`
   Should return:
   ```json
   {
     "status": "ok",
     "info": {
       "uptime": "...",
       "timestamp": "..."
     }
   }
   ```
2. **Swagger Documentation:**
   Open: `https://[YOUR_RENDER_SERVICE_URL].onrender.com/docs`
   Verify that all directory, auth, categories, domains, and admin endpoints are interactively visible.
3. **Categories API:**
   Open: `https://[YOUR_RENDER_SERVICE_URL].onrender.com/api/v1/categories`
   Verify that categories with their website counts load as JSON.

---

## 7. Connecting Frontend (Vercel) to Backend (Render)

When deploying your **Public Web App (`apps/web`)** and **Admin Console (`apps/admin`)** to Vercel:

Set the following environment variables in Vercel:

- `NEXT_PUBLIC_API_URL` = `https://[YOUR_RENDER_SERVICE_URL].onrender.com`
- Remember to update `CORS_ORIGIN` on Render to include your Vercel deployment URLs!
