# TasdiqCert — urgent INT257 completion checklist

## Implemented in this JavaScript revision
- [x] Convert all application `.tsx` files to `.jsx`.
- [x] Convert API routes, utilities, config and Prisma seed to `.js`.
- [x] Remove `tsconfig.json`; add `jsconfig.json`.
- [x] Remove TypeScript compiler, type packages and `tsx`.
- [x] Supabase PostgreSQL Prisma datasource and initial SQL migration.
- [x] Student registration and password login.
- [x] Bcrypt password hashing and signed HTTP-only session cookies.
- [x] Role checks for admin pages and APIs.
- [x] Institution-scoped admin certificate listing and dashboard.
- [x] Certificate issuance with unique IDs and audit log.
- [x] Certificate status update and revocation.
- [x] Public database-backed verification and verification history.
- [x] QR image generation and browser camera scanner.
- [x] PDF certificate generation with embedded QR.
- [x] CSV bulk issuance with per-row error reporting.
- [x] Student dashboard and certificates filtered by account email.
- [x] Responsive layout improvements.
- [x] Supabase setup, deployment and viva documentation.

## Must be completed on your machine with your private Supabase credentials
- [ ] Create a Supabase project and set `DATABASE_URL` in `.env`.
- [ ] Set a strong `AUTH_SECRET` and local `NEXT_PUBLIC_APP_URL`.
- [ ] Run `npm install` after downloading this revision.
- [ ] Run `npx prisma generate`.
- [ ] Run `npx prisma migrate deploy`.
- [ ] Run `npm run db:seed`.
- [ ] Sign in as demo administrator and change the password before production.
- [ ] Test student registration/login and student certificate view.
- [ ] Test certificate issuance, QR image, camera scan, PDF download and revocation.
- [ ] Run `npm run lint` and `npm run build`; fix any environment-specific errors.
- [ ] Push to GitHub, deploy to Vercel and set production environment variables.
- [ ] Run production migrations and test the deployed URL.
- [ ] Add actual GitHub/deployment URLs and team details to the submission documentation.

## Demo administrator
- Email: `admin@tasdiqcert.demo`
- Password: `Demo@12345`

These are demo credentials. Change them before any public deployment.

## Known limitations
The application is an academic demonstration, not a production credential authority. Email verification/password reset, rate limiting, institution onboarding/approval, automated test coverage, operational monitoring and backups are not included. Camera scanning requires localhost or HTTPS and browser camera permission.
