# Supabase setup — Credora

Credora uses Supabase-hosted PostgreSQL through Prisma. Authentication runs in the Next.js server; a Supabase service-role key is not needed.

## 1. Create a Supabase project

1. Create a project and store its database password privately.
2. Open **Project Settings → Database → Connection string → URI**.
3. Use a Prisma-compatible connection string (the Supabase session pooler is recommended where direct IPv6 access is unavailable). Include `sslmode=require` if required by the URI.
4. Do not share the database password or commit `.env`.

## 2. Configure the application

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — Supabase PostgreSQL connection URI.
- `AUTH_SECRET` — a private random secret with at least 32 characters.
- `NEXT_PUBLIC_APP_URL` — local URL for development and the HTTPS public URL after deployment.
- `INITIAL_INSTITUTION_NAME`, `INITIAL_INSTITUTION_SLUG`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` — one-time administrator bootstrap values. The password must have at least 12 characters.

Do not put database credentials, authentication secrets, or administrator passwords in any `NEXT_PUBLIC_*` variable.

## 3. Migrate and bootstrap an administrator

```bash
npm install
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The migrations add or update schema only; the lifecycle migration adds nullable certificate description, revocation, and audit-detail fields. It does not delete existing data or create sample certificates. Review the migration and confirm the target Supabase project before applying it.

The seed command creates or updates only the configured institution administrator. It requires the four `INITIAL_*` values and creates no demo students or certificates. Remove the `INITIAL_ADMIN_*` values from `.env` after bootstrap to prevent accidental password resets.

Open the configured local URL and sign in at `/login`. Student accounts can be registered at `/register`. Institution administrators can issue and manage certificates only for their assigned institution.

## 4. Production security

- Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and bootstrap values only in trusted server-side environment configuration.
- Keep secrets out of source control and browser bundles; rotate them if exposed.
- Run `npx prisma migrate deploy` against the production database as an explicitly approved release step.
- Use HTTPS for camera-based QR scanning.
- Public verification returns certificate ID, recipient name, institution, course, dates, and status; it does not return recipient email or account details.

## 5. Deploy

1. Configure the environment variables in the hosting provider.
2. Verify the production Supabase project and review pending migrations.
3. Run `npx prisma migrate deploy` against that project.
4. Provision the initial administrator through the seed command in a trusted environment, then remove bootstrap credentials.
5. Verify administrator scope, student ownership checks, PDF downloads, QR URLs, public verification, and revocation behavior.
