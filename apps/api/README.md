# API App

## Setup
1. Copy environment (PowerShell): `Copy-Item .env.example .env`
2. Install dependencies in repo root: `npm install`
3. Generate Prisma client: `npm --workspace @courier/api run prisma:generate`
4. Create schema: `npm --workspace @courier/api run prisma:migrate`
5. Seed initial data: `npm --workspace @courier/api run prisma:seed`
6. Start API: `npm --workspace @courier/api run start:dev`

## Seed Output
- Admin user: `+905000000001`
- Default password: `ChangeMe123!`
- City coefficients: `34`, `06`, `35`
- Pricing rules: Istanbul standard + boost

## Local Infra Ports
- Postgres: `localhost:55432`
- Redis: `localhost:56379`
