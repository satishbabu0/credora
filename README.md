# Credora — Digital Credential Verification

Credora is the existing Next.js certificate platform for institution-managed credential issuance, student access, PDF generation, QR codes, and public verification. It uses Supabase-hosted PostgreSQL through Prisma and does not create sample certificates during setup.

## Stack

- Next.js 15 App Router, React 19, JavaScript/JSX
- Tailwind CSS v4
- Supabase PostgreSQL with Prisma ORM
- Zod request validation, bcrypt password hashes, signed HTTP-only session cookies
- PDFKit, QRCode, and html5-qrcode

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `AUTH_SECRET` (at least 32 characters), and `NEXT_PUBLIC_APP_URL`. Keep these values private; never use `NEXT_PUBLIC_` for secrets.
3. Set `INITIAL_INSTITUTION_NAME`, `INITIAL_INSTITUTION_SLUG`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` in `.env` for the first administrator bootstrap. Use a unique password of at least 12 characters.
4. Install and initialize:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

5. Sign in at `/login` using the administrator credentials set privately above. Remove the `INITIAL_ADMIN_*` values from `.env` after the initial bootstrap so running the seed command cannot reset the administrator password unexpectedly.

The included lifecycle migration is additive: it adds nullable certificate description/revocation fields and audit details without deleting or rewriting existing records. Apply it with `npx prisma migrate deploy` against the intended database before using issuance or revocation.

## Certificate workflow

- Institution administrators are provisioned by the seed command; public registration creates student accounts only.
- An administrator issues a credential from `/admin/certificates/new`. The server validates fields, generates a unique ID, and atomically saves the credential and issuance audit record.
- `/admin/certificates` supports scoped search, status filtering, and pagination. Open **Details** to review the record, QR, and audit/verification history. Revocation requires a reason and cannot be reversed through the application.
- PDFs are available to the owning student and the issuing institution's administrators. Each includes the public verification QR code.
- Students can see only certificates matching their account email at `/student/certificates`; the page provides download and share actions.
- Anyone can verify at `/verify/[certificateId]` or scan at `/scan`. Public responses expose credential details only; student email and account data remain private.
- Bulk CSV imports require recipient name, recipient email, course/program, and issue date. Optional columns are `certificateTitle`, `expiryDate`, and `description`; download an empty template from `/admin/bulk-upload`.

## Routes

- `/login`, `/register` — administrator sign-in and student registration
- `/admin/dashboard`, `/admin/certificates`, `/admin/certificates/new` — protected administration
- `/admin/certificates/[id]` — certificate details and audit history
- `/student/dashboard`, `/student/certificates` — protected student access
- `/verify`, `/verify/[certificateId]`, `/scan` — public verification

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/certificates?q=&status=&page=` and `POST /api/certificates`
- `PATCH /api/certificates/[id]` — update permitted fields or revoke with `{ "status": "REVOKED", "reason": "..." }`
- `POST /api/certificates/bulk`
- `GET /api/certificates/[id]/pdf`
- `GET /api/qr/[certificateId]`, `GET /api/verify/[certificateId]`

## Validation

```bash
npx prisma validate
npx prisma generate
npm run test
npm run lint
npm run build
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database configuration and [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for request and response behavior.
