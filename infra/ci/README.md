# CI/CD Infrastructure

The automated CI/CD pipeline for FinalLinks is implemented via GitHub Actions:

- Primary Workflow: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Pipeline Stages

1. **Lint & Typecheck:**
   - Prettier code style check (`pnpm format:check`)
   - ESLint static analysis (`pnpm lint`)
   - Monorepo-wide strict TypeScript typechecking (`pnpm typecheck`)

2. **Test:**
   - PostgreSQL 17 and Redis 7 service containers in CI
   - Prisma automated migration and client generation
   - Comprehensive Vitest unit and integration test execution (40+ test cases)

3. **Production Build:**
   - Monorepo production build with Turborepo (`pnpm turbo run build --concurrency=1`)
   - Validates Next.js standalone outputs and NestJS compilation
