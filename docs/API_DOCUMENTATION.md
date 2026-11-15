# Credora API Documentation

All API routes are implemented in JavaScript. Administrative routes require a current administrator account; institution administrators are restricted to their assigned institution. Student certificate downloads are restricted to the signed-in student's email.

## Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a student and create a session |
| POST | `/api/auth/login` | Public | Verify credentials and create a session |
| POST | `/api/auth/logout` | Session | Clear the session cookie |
| GET | `/api/auth/me` | Session | Return the current database-backed user |

Administrator accounts are provisioned by the private bootstrap seed command. Public registration cannot create administrator roles.

## Certificates

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/certificates?q=&status=&page=` | Admin | Search/filter/paginate certificates in authorized scope |
| POST | `/api/certificates` | Admin | Validate and issue a certificate; atomically audit the issuance |
| PATCH | `/api/certificates/[id]` | Admin | Update editable fields or revoke with a required reason |
| DELETE | `/api/certificates/[id]` | Admin | Revoke with a required JSON reason |
| POST | `/api/certificates/bulk` | Admin | Validate and import CSV certificate rows |
| GET | `/api/certificates/[id]/pdf` | Owner or relevant admin | Download an authorized PDF with its verification QR |
| GET | `/api/institutions` | Admin | Return institutions the administrator may issue for |

Issue JSON requires `recipientName`, `recipientEmail`, `courseName`, `certificateTitle`, `institutionId`, and `issueDate` (`YYYY-MM-DD`). `expiryDate` and `description` are optional. Institution administrators cannot override their institution scope.

Revoke with:

```json
{
  "status": "REVOKED",
  "reason": "The credential was issued in error."
}
```

The server stores the revocation reason and timestamp and adds an audit record in the same transaction. A revoked certificate cannot be reactivated through this API.

## Public verification

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/qr/[certificateId]` | Public | Return a QR PNG linking to the credential's public route |
| GET | `/api/verify/[certificateId]` | Public | Resolve live status and record a verification |

Successful verification returns `certificateId`, `recipientName`, `institution`, `courseName`, `issueDate`, `expiryDate`, and status. It never includes recipient email, password hashes, or account details. Status is resolved from the live database; an elapsed expiry date or revocation is never returned as valid. Unknown IDs return `NOT_FOUND`; service failures return HTTP 500 rather than a false not-found response.

Bulk CSV imports require recipient name, recipient email, course name, and issue date. `certificateTitle`, `expiryDate`, and `description` are optional. Up to 1,000 data rows are accepted per request.
