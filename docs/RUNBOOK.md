# FindFunLinks — Operations & Deployment Runbook

## 1. Local Development Quickstart

### Prerequisites

- Node.js `v20+` or `v22+`
- pnpm `v9+` or `v10+`
- Docker & Docker Compose

### Starting the Infrastructure

```bash
# Start PostgreSQL, Redis, and Mailpit
docker compose -f infra/docker/docker-compose.yml up -d
```

### Installing Dependencies & Starting All Services

```bash
# Install monorepo dependencies
pnpm install

# Run database migrations and seed script
pnpm --filter @findfunlinks/api db:migrate
pnpm --filter @findfunlinks/api db:seed

# Start all applications in parallel via Turborepo
pnpm dev
```

Default Local Ports:

- Public Web (`apps/web`): `http://localhost:3000`
- Super Admin (`apps/admin`): `http://localhost:3001`
- Website Owner (`apps/owner`): `http://localhost:3002`
- NestJS API (`apps/api`): `http://localhost:4000/api/v1`
- API Swagger Docs: `http://localhost:4000/docs`
- Mailpit Web UI: `http://localhost:8025`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

## 2. Environment Variables & Secrets Management

Each application has its own `.env.example`:

- `apps/web/.env.example`
- `apps/admin/.env.example`
- `apps/owner/.env.example`
- `apps/api/.env.example`

_Rule:_ Never commit `.env` or production secrets into Git.

---

## 3. Email & Domain Security Configuration (Production)

For production transactional emails:

- **SPF:** `v=spf1 include:_spf.example.com ~all`
- **DKIM:** Generated public key DNS TXT record for `mail._domainkey.findfunlinks.com`
- **DMARC:** `v=DMARC1; p=reject; rua=mailto:dmarc-reports@findfunlinks.com; pct=100; adkim=s; aspf=s`
