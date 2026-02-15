# Courier App Monorepo

This repository contains a working MVP foundation for a courier platform.

## Apps
- `apps/api`: NestJS backend API
- `apps/sender-mobile`: React Native sender app (individual + corporate)
- `apps/courier-mobile`: React Native courier app

## Packages
- `packages/shared-types`: Shared domain types between apps
- `packages/ui-kit`: Shared UI component placeholders

## Quick Start
1. Install dependencies: `npm install`
2. Copy env (PowerShell): `Copy-Item apps/api/.env.example apps/api/.env`
3. Start local infrastructure (Postgres + Redis): `npm run infra:up`
4. Generate Prisma client: `npm --workspace @courier/api run prisma:generate`
5. Push schema to database: `npm run api:db:push`
6. Seed baseline data: `npm run api:seed`
7. Start API: `npm run dev:api`
8. Start sender mobile: `npm run dev:sender`
9. Start courier mobile: `npm run dev:courier`

## Notes
- API and database models are aligned with `PRD.md`, `ARCHITECTURE.md`, and `API.md`.
- Prisma schema is located at `apps/api/prisma/schema.prisma`.
- Docker ports used by this project: Postgres `55432`, Redis `56379`.
- If you use Android emulator, API base URL is `http://10.0.2.2:3000/api/v1`.
- If you use iOS simulator/web, API base URL is `http://localhost:3000/api/v1`.
