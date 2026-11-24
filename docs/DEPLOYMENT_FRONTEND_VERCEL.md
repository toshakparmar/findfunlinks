# FinalLinks — Frontend Deployment Guide (Vercel)

This guide walks you through deploying both frontend applications to **[Vercel](https://vercel.com)**:

1. **Public Web App (`apps/web`)** — The public directory discovery portal.
2. **Admin Console (`apps/admin`)** — The Super Admin & Website Owner management dashboard.

Both apps are connected to your live Render backend: **`https://findfunlinks.onrender.com`**.

---

## 1. Deploying the Public Web App (`apps/web`)

### Step 1: Create New Project on Vercel

1. Go to **[Vercel Dashboard](https://vercel.com/new)**.
2. Select your repository: **`findfunlinks`** (or `toshakparmar/findfunlinks`).
3. Click **Import**.

### Step 2: Configure Project Settings

- **Project Name:** `finallinks-web` (or `findfunlinks-web`)
- **Framework Preset:** `Next.js`
- **Root Directory:** Click **Edit**, select **`apps/web`**, and click **Continue**.
- **Include files outside the Root Directory:** Ensure this toggle is checked **ON** (required for monorepo packages like `@finallinks/ui`, `@finallinks/contracts`, `@finallinks/api-client`).

### Step 3: Build & Development Settings

Leave Build Command as default or set:

- **Build Command:** `pnpm --filter @finallinks/web build`
- **Install Command:** `pnpm install`
- **Output Directory:** `.next`

### Step 4: Add Environment Variables

In the **Environment Variables** section, add:

| Key                             | Value                                                                                                                                                                                                              | Description                                      |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| `NEXT_PUBLIC_API_URL`           | `https://findfunlinks.onrender.com`                                                                                                                                                                                | Your live Render backend URL (no trailing slash) |
| `NEXT_PUBLIC_APP_URL`           | `https://finallinks-web.vercel.app`                                                                                                                                                                                | Your Vercel domain for this app                  |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://elwszhwgeshqmjdhsbep.supabase.co`                                                                                                                                                                         | Supabase Project URL                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsd3N6aHdnZXNocW1qZGhzYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NzI0OTYsImV4cCI6MjExMDU0ODQ5Nn0.hRPsDAZrnLUCECNrIwTqUnv6gpNj8O9qkSRD_OOssws` | Supabase Anonymous Key                           |

_(Optional)_ `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: (Only if Cloudflare Turnstile CAPTCHA is enabled).

### Step 5: Deploy

Click **Deploy**. Vercel will build and assign a domain (e.g., `https://finallinks-web.vercel.app`).

---

## 2. Deploying the Admin Console (`apps/admin`)

### Step 1: Create Second Project on Vercel

1. Go back to **[Vercel Dashboard](https://vercel.com/new)**.
2. Select the same repository: **`findfunlinks`**.
3. Click **Import**.

### Step 2: Configure Project Settings

- **Project Name:** `finallinks-admin` (or `findfunlinks-admin`)
- **Framework Preset:** `Next.js`
- **Root Directory:** Click **Edit**, select **`apps/admin`**, and click **Continue**.
- **Include files outside the Root Directory:** Ensure this toggle is checked **ON**.

### Step 3: Build & Development Settings

- **Build Command:** `pnpm --filter @finallinks/admin build`
- **Install Command:** `pnpm install`
- **Output Directory:** `.next`

### Step 4: Add Environment Variables

In the **Environment Variables** section, add:

| Key                             | Value                                                                                                                                                                                                              | Description                                      |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| `NEXT_PUBLIC_API_URL`           | `https://findfunlinks.onrender.com`                                                                                                                                                                                | Your live Render backend URL (no trailing slash) |
| `NEXT_PUBLIC_APP_URL`           | `https://finallinks-admin.vercel.app`                                                                                                                                                                              | Your Vercel domain for the Admin Console         |
| `NEXT_PUBLIC_PUBLIC_WEB_URL`    | `https://finallinks-web.vercel.app`                                                                                                                                                                                | The Public Web URL from Step 1                   |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://elwszhwgeshqmjdhsbep.supabase.co`                                                                                                                                                                         | Supabase Project URL                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsd3N6aHdnZXNocW1qZGhzYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NzI0OTYsImV4cCI6MjExMDU0ODQ5Nn0.hRPsDAZrnLUCECNrIwTqUnv6gpNj8O9qkSRD_OOssws` | Supabase Anonymous Key                           |

### Step 5: Deploy

Click **Deploy**. Vercel will build and assign a domain (e.g., `https://finallinks-admin.vercel.app`).

---

## 3. Final Step: Link Backends & Enable CORS on Render

Once both frontends are deployed on Vercel, you **must update the Render environment variables** so that the backend accepts cross-origin cookie-authenticated requests:

1. Open your **Render Dashboard** -> **`finallinks-api`** (or `findfunlinks`).
2. Go to **Environment** in the left sidebar.
3. Update or set the following variables:

```env
CORS_ORIGIN=https://finallinks-web.vercel.app,https://finallinks-admin.vercel.app
PUBLIC_WEB_URL=https://finallinks-web.vercel.app
ADMIN_PANEL_URL=https://finallinks-admin.vercel.app
OWNER_PANEL_URL=https://finallinks-admin.vercel.app
```

_(Replace `https://finallinks-web.vercel.app` and `https://finallinks-admin.vercel.app` with your actual Vercel generated URLs or custom domains)._

4. Click **Save Changes**. Render will automatically redeploy the backend with the new origins.

---

## 4. Verification Checklist

- [ ] Visit Public Web App: Browse categories, search, test star rating and submit website.
- [ ] Visit Admin Console: Login with `admin@finallinks.com` / `SuperAdmin123!`.
- [ ] Check Network tab in browser Developer Tools: Confirm requests to `https://findfunlinks.onrender.com/api/v1/...` return `200 OK` with proper CORS headers.
