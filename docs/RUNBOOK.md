# FindFunLinks — Operations & Deployment Runbook

## 1. System Requirements & Prerequisites

- **Node.js:** `v22.x` (LTS recommended)
- **Package Manager:** `pnpm v10.17.0+`
- **Containers:** Docker `26+` and Docker Compose `v2+`
- **Database:** PostgreSQL `17.x`
- **Cache & Queue:** Redis `7.x`
- **Reverse Proxy:** Nginx `1.26+`

---

## 2. Local Development Quickstart

### Step 1: Start Backing Services

```bash
# Start PostgreSQL, Redis, and Mailpit in background
docker compose -f infra/docker/docker-compose.yml up -d
```

### Step 2: Install Monorepo Dependencies

```bash
pnpm install
```

### Step 3: Run Database Migrations and Seed

```bash
# Run Prisma migrations against local database
pnpm --filter @findfunlinks/api db:migrate

# Seed categories, default admin user, initial tags, and system settings
pnpm --filter @findfunlinks/api db:seed
```

### Step 4: Start Development Servers

```bash
# Start all 4 applications concurrently
pnpm dev
```

### Local Development Ports:

| Service                   | URL / Port                     | Credentials / Notes                                   |
| ------------------------- | ------------------------------ | ----------------------------------------------------- |
| **Public Directory**      | `http://localhost:3000`        | Public consumer portal                                |
| **Super Admin Console**   | `http://localhost:3001`        | `admin@findfunlinks.com` / `SuperAdminSecretPass123!` |
| **Website Owner Portal**  | `http://localhost:3002`        | Owner credentials                                     |
| **NestJS REST API**       | `http://localhost:4000/api/v1` | Core API                                              |
| **Swagger Documentation** | `http://localhost:4000/docs`   | Interactive OpenAPI UI                                |
| **Mailpit Web UI**        | `http://localhost:8025`        | Local transactional email inspector                   |
| **PostgreSQL**            | `localhost:5432`               | User: `postgres`, Password: `postgres`                |
| **Redis**                 | `localhost:6379`               | Port 6379                                             |

---

## 3. Production Deployment with Docker Compose

FindFunLinks provides a fully containerized, production-grade Docker Compose stack:

### Step 1: Configure Environment Variables

Copy `.env.example` to `.env` and configure production secrets:

```bash
cp .env.example .env
```

Ensure that:

1. `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are generated with cryptographically strong keys (e.g. `openssl rand -hex 32`).
2. `POSTGRES_PASSWORD` is set to a secure secret.
3. `ENABLE_SWAGGER` is set to `"false"`.
4. `CORS_ORIGIN` contains your production domain names.

### Step 2: Build & Launch the Entire Production Stack

```bash
docker compose up -d --build
```

### Step 3: Run Database Migrations in Container

```bash
docker compose exec api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

### Step 4: Verify Container Health

```bash
docker compose ps
```

All containers (`postgres`, `redis`, `api`, `web`, `admin`, `owner`, `nginx`) should report `healthy` or `running`.

---

## 4. Database Operations & Maintenance

### Automated Daily Backup Script

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/findfunlinks"
mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U postgres -d findfunlinks_prod -F c > "$BACKUP_DIR/db_backup_$TIMESTAMP.dump"

# Retain last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +14 -exec rm {} +
```

### Database Restore Procedure

```bash
# 1. Stop API to avoid active connections
docker compose stop api

# 2. Restore database from dump
docker compose exec -T postgres pg_restore -U postgres -d findfunlinks_prod --clean --if-exists /path/to/backup.dump

# 3. Restart API
docker compose start api
```

### Prisma Schema Migration Guidelines

1. Always apply schema modifications via Prisma migrations:
   ```bash
   pnpm --filter @findfunlinks/api db:migrate
   ```
2. For production environments, run `prisma migrate deploy` (never `prisma db push` in production).

---

## 5. Monitoring & Health Checks

- **General Health:** `GET /api/v1/health` — Checks basic API process uptime.
- **Liveness Probe:** `GET /api/v1/health/live` — Kubernetes / Docker liveness check (200 OK).
- **Readiness Probe:** `GET /api/v1/health/ready` — Verifies database connection pool and Redis reachability.

---

## 6. Incident Response Playbooks

### Playbook 1: Compromised Account or Token Family Replay

If suspicious session activity or refresh token theft is detected:

1. Immediately invoke revocation for the targeted user:
   ```sql
   UPDATE "RefreshToken" SET "isRevoked" = true WHERE "userId" = 'TARGET_USER_ID';
   UPDATE "User" SET "mustChangePassword" = true WHERE "id" = 'TARGET_USER_ID';
   ```
2. The user will be instantly logged out and forced to reset their password.

### Playbook 2: Redis Failure or Queue Stall

If background health checks or transactional emails fail:

1. Verify Redis connectivity:
   ```bash
   docker compose exec redis redis-cli ping
   ```
2. Inspect BullMQ queue backlog:
   ```bash
   docker compose logs -f api
   ```
3. Restart Redis and API worker:
   ```bash
   docker compose restart redis api
   ```

### Playbook 3: Emergency Maintenance Mode

To enable temporary maintenance mode at the Nginx edge:

1. Edit `infra/nginx/nginx.conf` and set:
   ```nginx
   return 503 "FindFunLinks is undergoing scheduled maintenance. Please check back shortly.";
   ```
2. Reload Nginx without dropping connections:
   ```bash
   docker compose exec nginx nginx -s reload
   ```
