# Courier App Monorepo

This repository contains the first implementation scaffold for a courier platform.

## Apps
- `apps/api`: NestJS backend API
- `apps/sender-mobile`: React Native sender app (individual + corporate)
- `apps/courier-mobile`: React Native courier app

## Packages
- `packages/shared-types`: Shared domain types between apps
- `packages/ui-kit`: Shared UI component placeholders

## Quick Start
1. Install dependencies: `npm install`
2. Copy env: `cp apps/api/.env.example apps/api/.env`
3. Start API: `npm run dev:api`
4. Start sender mobile: `npm run dev:sender`
5. Start courier mobile: `npm run dev:courier`

## Notes
- API and database models are aligned with `PRD.md`, `ARCHITECTURE.md`, and `API.md`.
- Prisma schema is located at `apps/api/prisma/schema.prisma`.
