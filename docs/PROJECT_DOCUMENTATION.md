# Project Documentation — TasdiqCert

## Project title
TasdiqCert — Digital Certificate Verification Platform.

## Problem statement
Paper and static digital certificates can be difficult to verify quickly. A verifier may not know whether a certificate is genuine, revoked, or expired. TasdiqCert provides a centralized digital record and public verification workflow using a unique certificate identifier and QR code.

## Objectives
- Demonstrate a digital certificate lifecycle.
- Provide certificate ID and QR-based lookup.
- Show current credential status, including revoked and expired states.
- Maintain verification and audit history.
- Provide institution-admin and student-facing workflows.
- Generate downloadable PDF certificates.

## Implemented features
1. Public landing page and platform information.
2. Student registration and sign-in.
3. Administrator sign-in using a seeded demo account.
4. Password hashing with bcryptjs.
5. Signed HTTP-only session cookies.
6. Role-aware admin and student route access.
7. Institution-scoped certificate listing and administration.
8. Certificate issuance with unique ID generation.
9. Certificate status updates and revocation.
10. Database-backed public verification.
11. Verification history logging.
12. QR PNG generation for each certificate.
13. Camera-based QR scanning on localhost/HTTPS.
14. PDF certificate generation with embedded verification QR.
15. CSV bulk certificate issuance with row-level error reporting.
16. Student dashboard and certificate list filtered by registered email.
17. Admin dashboard statistics and recent certificates.
18. Responsive layouts for desktop and mobile.
19. Zod request validation and server-side error handling.
20. Prisma schema, initial PostgreSQL migration and demo seed.

## Technologies
Next.js 15, React 19, JavaScript (ES modules) and JSX, Tailwind CSS v4, Supabase-hosted PostgreSQL, Prisma ORM, Zod, bcryptjs, jose, qrcode, html5-qrcode, PDFKit and Lucide React.

## Architecture
- Browser pages are rendered with Next.js App Router.
- Server Components query PostgreSQL through Prisma.
- Client Components handle forms, logout and camera scanning.
- Route Handlers validate requests and apply session/role checks.
- Passwords are hashed; session tokens are signed and stored in HTTP-only cookies.
- Supabase provides hosted PostgreSQL. The app does not expose database credentials to the browser.

## Project structure
`app/` contains routes, layouts and API handlers; `components/` contains reusable UI; `lib/` contains authentication and database utilities; `prisma/` contains the schema, migrations and seed; `docs/` contains project documentation; `reference/` contains supplied project reference materials.

## Institution administrator setup
Configure the institution and initial administrator through private `INITIAL_*` environment variables, then run the seed command. The seed does not create sample students or certificates. Never put administrator passwords or database/authentication secrets in this document or source control.

## Team contribution
Complete this section with actual team member names, registration numbers and verified contributions before submission.

## GitHub and deployment
Add the actual GitHub repository URL and deployed URL after publishing. Do not submit placeholders.

## Limitations and production considerations
Before real institutional use, add email verification, password reset, rate limiting, stronger institution onboarding/approval, backup/monitoring policies and a formal security review. Configure production secrets through the hosting provider.

## Conclusion
Credora provides certificate issuance, QR-assisted verification, status management and student/admin workflows using a JavaScript full-stack application backed by Supabase PostgreSQL.
