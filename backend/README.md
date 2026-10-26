# Local backend and PostgreSQL

The backend uses the existing NestJS controllers/services and Prisma PostgreSQL schema. The original migrations define the initial schema and its constraints/triggers/views. Schema comparison identified fields already present in the Prisma models but absent from those migrations (`categories.slug`, `products.slug`, `product_variants.color`, `product_variants.size`); an incremental migration adds them. Category slugs remain nullable for legacy rows because their historical values are unknown; creating a new category still requires a slug.

## One-time local configuration

Copy `.env.example` to `.env`, then replace the placeholders with local-only values. Use a random hex password for `POSTGRES_PASSWORD` and put the same value in `DATABASE_URL`. Set `JWT_SECRET` to a separate random value of at least 32 bytes. The root `.gitignore` ignores `.env`.

The local setup in this workspace already has a generated ignored `backend/.env`. Never commit it or share its contents.

## Start services (in order)

From the repository root:

```sh
docker compose --env-file backend/.env -f backend/docker-compose.yml up -d --wait postgres
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run start:dev
```

The first command starts PostgreSQL 16 on port 5432. Compose uses a health check and the persistent named volume `e-commerce-platform-postgres-data`. It is intentionally separate from any existing PostgreSQL 13 volumes; do not remove old volumes to resolve version errors.

Keep the backend process running. In another terminal, from the repository root, start the frontend:

```sh
cd frontend
npm install
npm run dev -- --port 5174
```

The current `frontend/.env` points to `http://localhost:3000`; the backend allows CORS from Vite on ports 5173 and 5174. To change the backend port, update `PORT` in `backend/.env` and `VITE_API_BASE_URL` in `frontend/.env`.

Production-oriented alternatives are `npm run build` followed by `npm run start`; migration application is `npm run prisma:deploy`. `npm run prisma:migrate` runs Prisma's interactive development migration workflow.

## Verify without creating an account

In another terminal:

```sh
docker compose --env-file backend/.env -f backend/docker-compose.yml ps
curl -i -X OPTIONS http://localhost:3000/auth/signup \
  -H 'Origin: http://localhost:5174' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
curl -i http://localhost:3000/users/me
```

PostgreSQL should show `healthy`, the CORS preflight should return `204` with `Access-Control-Allow-Origin`, and `/users/me` should return `401` without a bearer token. To verify the signup route without creating an account, send an invalid request and expect `400` validation messages:

```sh
curl -i -X POST http://localhost:3000/auth/signup \
  -H 'Content-Type: application/json' \
  --data '{"email":"invalid","password":"x","phone":"123"}'
```

For a real signup, use the frontend and provide a unique valid email and Vietnamese mobile number matching `^0[35789][0-9]{8}$`. A successful response returns `{ "access_token": "…" }`; the frontend then calls `GET /users/me`. Do not share the token or password.

## Local configuration variables

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: local Compose database.
- `DATABASE_URL`: Prisma connection URL for the local PostgreSQL database.
- `JWT_SECRET`: local bearer-token signing secret.
- `PORT`: backend HTTP port (default 3000).
- `CORS_ORIGINS`: comma-separated browser origins (defaults to localhost ports 5173 and 5174).

No product/category APIs were fabricated. The existing modules are registered in the Nest application as-is.

## Existing API implementation caveats

The new migration reconciles the Prisma schema with the initial SQL migrations, but it does not rewrite existing feature services. Some existing non-auth service contracts still disagree with the Prisma models: product list/create code uses scalar `price` and `images` fields that are relations/variant data in the Prisma model; shop request DTOs use `logo` while the model field is `logoUrl`; and address DTO fields differ from the Prisma `Address` fields. Those feature operations may need a separate contract decision and were not changed here.
