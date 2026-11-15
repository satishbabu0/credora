# Credora — Digital Credential Verification Platform

<p align="center">
  <strong>Every achievement deserves to be trusted.</strong>
</p>

<p align="center">
  A secure, institution-managed platform for issuing, managing, accessing, and verifying digital certificates.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Status-In%20Development-orange" alt="Project status" />
</p>

---

## Overview

**Credora** is a digital credential management and verification platform designed to help educational institutions issue, manage, and authenticate certificates through a centralized web application.

Traditional paper-based certificates can be difficult to manage, verify, and protect against unauthorized modification or duplication. Credora addresses these challenges by providing digital certificate issuance, QR-code-based verification, secure student access, and PDF certificate generation.

The platform provides separate experiences for institution administrators, students, and public certificate verifiers.

## Key Features

### Institution Administration
- Secure administrator authentication.
- Institution-managed certificate issuance.
- Unique certificate identification.
- Certificate search, filtering, and pagination.
- Certificate lifecycle management.
- Certificate revocation with mandatory reason.
- Audit history for certificate activities.
- Bulk certificate issuance through CSV uploads.

### Student Portal
- Secure student registration and login.
- Personalized student dashboard.
- Access to certificates associated with the student's account email.
- Certificate PDF downloads.
- Certificate sharing functionality.

### Digital Certificate Verification
- Public certificate verification using a unique certificate ID.
- QR-code generation for issued certificates.
- QR-code scanning through the browser.
- Public verification without requiring an account.
- Clear certificate status, including revoked credentials.
- Protection of private student account information.

### Security and Reliability
- Password hashing using bcrypt.
- Signed HTTP-only session cookies.
- Server-side request validation with Zod.
- Protected administrator and student routes.
- Institution-scoped certificate access.
- Transactional certificate issuance and audit recording.
- Additive Prisma database migrations.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 15 | Full-stack application framework |
| React 19 | Component-based user interface |
| JavaScript / JSX | Application development |
| Tailwind CSS v4 | Responsive styling |
| Supabase PostgreSQL | Hosted relational database |
| Prisma ORM | Database access and migrations |
| Zod | Request validation |
| bcrypt | Password hashing |
| PDFKit | PDF certificate generation |
| QRCode | QR-code generation |
| html5-qrcode | Browser-based QR scanning |

## Application Architecture

Credora follows a full-stack Next.js architecture.

```text
                    CREDORA
                       |
          +------------+------------+
          |                         |
      Frontend                  Backend
          |                         |
    Next.js App Router        API Route Handlers
          |                         |
    React Components         Authentication
    Responsive UI            Validation (Zod)
    Student Portal           Certificate Services
    Admin Dashboard          Verification Services
          |                         |
          +------------+------------+
                       |
                  Prisma ORM
                       |
              Supabase PostgreSQL
```

## Certificate Lifecycle

The platform supports a structured certificate workflow:

1. An institution administrator signs in.
2. The administrator enters recipient and certificate information.
3. The server validates the submitted information.
4. A unique certificate ID is generated.
5. The certificate and its issuance audit record are saved transactionally.
6. A QR code is generated for public verification.
7. The student accesses and downloads the certificate.
8. Anyone can verify the certificate using its ID or QR code.
9. An administrator can revoke a certificate by providing a reason.

**Important:** Revocation is recorded in the certificate history and cannot be reversed through the application.

## Application Routes

### Public Routes

| Route | Description |
|---|---|
| `/` | Credora homepage |
| `/about` | About the platform |
| `/how-it-works` | Certificate workflow explanation |
| `/login` | User login |
| `/register` | Student registration |
| `/verify` | Certificate verification |
| `/verify/[certificateId]` | Individual certificate verification |
| `/scan` | QR-code scanning |

### Administrator Routes

| Route | Description |
|---|---|
| `/admin/dashboard` | Administrator dashboard |
| `/admin/certificates` | Certificate management |
| `/admin/certificates/new` | Issue a new certificate |
| `/admin/certificates/[id]` | Certificate details and audit history |
| `/admin/bulk-upload` | Bulk certificate upload |
| `/admin/organizations` | Organization management |
| `/admin/reports` | Reports |
| `/admin/settings` | Administrator settings |

### Student Routes

| Route | Description |
|---|---|
| `/student/dashboard` | Student dashboard |
| `/student/certificates` | Student certificate collection |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a student |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/logout` | End the current session |
| GET | `/api/auth/me` | Retrieve the current user |

### Certificate Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/certificates` | Retrieve certificates with search, status filtering, and pagination |
| POST | `/api/certificates` | Issue a certificate |
| PATCH | `/api/certificates/[id]` | Update permitted fields or revoke a certificate |
| POST | `/api/certificates/bulk` | Process bulk certificate uploads |
| GET | `/api/certificates/[id]/pdf` | Generate or download a certificate PDF |

### Verification and QR Codes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/verify/[certificateId]` | Retrieve public verification information |
| GET | `/api/qr/[certificateId]` | Generate or retrieve a certificate QR code |

## Getting Started

Follow these instructions to run Credora locally.

### Prerequisites

Install the following:

- Node.js
- npm
- Git
- A Supabase project with PostgreSQL enabled

### 1. Clone the repository

```bash
git clone https://github.com/satishbabu0/credora.git
cd credora
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as the template.

```env
DATABASE_URL="YOUR_SUPABASE_DATABASE_CONNECTION_STRING"

AUTH_SECRET="YOUR_SECURE_RANDOM_SECRET_AT_LEAST_32_CHARACTERS"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

INITIAL_INSTITUTION_NAME="Your Institution"
INITIAL_INSTITUTION_SLUG="your-institution"
INITIAL_ADMIN_EMAIL="admin@example.com"
INITIAL_ADMIN_PASSWORD="YOUR_UNIQUE_PASSWORD_AT_LEAST_12_CHARACTERS"
```

Replace the example values with your own configuration.

**Security requirements:**
- Never commit `.env` to GitHub.
- Never expose database credentials or authentication secrets.
- Do not prefix private secrets with `NEXT_PUBLIC_`.
- Use a strong, unique administrator password.
- Remove the `INITIAL_ADMIN_*` variables after the first administrator bootstrap.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply database migrations

```bash
npx prisma migrate deploy
```

### 6. Initialize the administrator account

```bash
npm run db:seed
```

The seed process provisions the initial institution administrator using the configured environment variables. It does not create sample certificates.

### 7. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Sign in at `/login` using the administrator credentials configured during initial setup.

For additional database configuration instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## CSV Bulk Upload

Administrators can upload multiple certificates through the bulk-upload interface.

**Required CSV columns:**

| Column | Description |
|---|---|
| `recipientName` | Certificate recipient's name |
| `recipientEmail` | Recipient's email address |
| `course` | Course or program name |
| `issueDate` | Certificate issue date |

**Optional columns:**

- `certificateTitle`
- `expiryDate`
- `description`

An empty CSV template can be downloaded from the administrator bulk-upload page.

## Validation and Quality Checks

Run the following commands before committing changes or deploying:

```bash
# Validate Prisma schema
npx prisma validate

# Generate Prisma Client
npx prisma generate

# Run automated tests
npm run test

# Run lint checks
npm run lint

# Create production build
npm run build
```

## Project Structure

```text
credora/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (public)/
│   │   ├── about/
│   │   ├── how-it-works/
│   │   ├── scan/
│   │   └── verify/
│   │
│   ├── admin/
│   ├── student/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── certificates/
│   │   ├── institutions/
│   │   ├── qr/
│   │   └── verify/
│   │
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── certificates/
│   ├── ui/
│   └── verification/
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── PROJECT_DOCUMENTATION.md
│   └── VIVA_PREPARATION.md
│
├── lib/
│   ├── auth.js
│   ├── certificate.js
│   ├── date.js
│   ├── db.js
│   └── verification.js
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── tests/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Documentation

Additional project documentation is available in the `docs/` directory:

- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Viva Preparation](./docs/VIVA_PREPARATION.md)
- [Supabase Setup](./SUPABASE_SETUP.md)

## Academic Project Information

| Field | Details |
|---|---|
| Project Name | Credora — Digital Credential Verification |
| Course Code | INT257 |
| Primary Technology | Next.js |
| Frontend | React and Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| ORM | Prisma |

## Project Links

| Resource | Link |
|---|---|
| GitHub Repository | [satishbabu0/credora](https://github.com/satishbabu0/credora) |
| Live Application | Coming soon |
| Video Presentation | To be added |

## Future Enhancements

Potential future improvements include:

- Institution onboarding and self-service management.
- Custom certificate design templates.
- Advanced analytics and reporting.
- Email notifications for issued certificates.
- Enhanced certificate search and discovery.
- Integration APIs for external academic systems.

## Contributing

Contributions, suggestions, and feedback are welcome.

For significant changes, create a separate branch, implement the changes, and submit a pull request for review.

## License

No open-source license has been selected for this repository yet. All rights are reserved by the project owner unless a license is added.

---

<p align="center">
  <strong>Credora</strong><br/>
  Every achievement deserves to be trusted.
</p>
