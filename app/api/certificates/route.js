import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateCertificateId, resolveStatus } from '@/lib/certificate';
import { requireAdmin } from '@/lib/auth';

const dateOnly = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.')
  .refine(value => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Enter a valid date.');

const schema = z.object({
  recipientName: z.string().trim().min(2).max(120),
  recipientEmail: z.string().trim().email().max(160),
  courseName: z.string().trim().min(2).max(160),
  institutionId: z.string().trim().min(1),
  certificateTitle: z.string().trim().min(2).max(160),
  issueDate: dateOnly,
  expiryDate: z.union([dateOnly, z.literal(''), z.null()]).optional().transform(value => value || null),
  description: z.string().trim().max(2000).optional().transform(value => value || null)
}).superRefine((data, context) => {
  if (data.expiryDate && data.expiryDate < data.issueDate) {
    context.addIssue({
      code: 'custom',
      path: ['expiryDate'],
      message: 'Expiry date cannot be before the issue date.'
    });
  }
});

function getStatusFilter(status) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (status === 'VALID') {
    return {
      status: 'VALID',
      OR: [{ expiryDate: null }, { expiryDate: { gte: today } }]
    };
  }
  if (status === 'REVOKED') return { status: 'REVOKED' };
  if (status === 'PENDING') return { status: 'PENDING' };
  if (status === 'EXPIRED') {
    return {
      OR: [
        { status: 'EXPIRED' },
        { status: { notIn: ['REVOKED', 'PENDING'] }, expiryDate: { lt: today } }
      ]
    };
  }
  return null;
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const params = new URL(request.url).searchParams;
  const query = (params.get('q') || '').trim().slice(0, 120);
  const status = params.get('status') || '';
  if (status && !['VALID', 'EXPIRED', 'REVOKED', 'PENDING'].includes(status)) {
    return NextResponse.json({ error: 'Unsupported certificate status filter.' }, { status: 400 });
  }
  const requestedPage = Number.parseInt(params.get('page') || '1', 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = 50;
  const clauses = [];

  if (auth.session.role === 'INSTITUTION_ADMIN') {
    clauses.push({ institutionId: auth.session.institutionId });
  }
  if (query) {
    clauses.push({
      OR: [
        { recipientName: { contains: query, mode: 'insensitive' } },
        { certificateId: { contains: query, mode: 'insensitive' } }
      ]
    });
  }
  const statusFilter = getStatusFilter(status);
  if (statusFilter) clauses.push(statusFilter);

  const where = clauses.length ? { AND: clauses } : {};
  try {
    const [total, records] = await Promise.all([
      db.certificate.count({ where }),
      db.certificate.findMany({
        where,
        include: { institution: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    const certificates = records.map(certificate => ({
      ...certificate,
      status: resolveStatus(certificate.status, certificate.expiryDate)
    }));
    return NextResponse.json({
      certificates,
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    console.error('Certificate list query failed:', error);
    return NextResponse.json({ error: 'Unable to load certificates right now.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Check the certificate details.' }, { status: 400 });
  }

  const data = parsed.data;
  const institutionId = auth.session.role === 'SUPER_ADMIN'
    ? data.institutionId
    : auth.session.institutionId;
  try {
    const institution = await db.institution.findUnique({ where: { id: institutionId } });
    if (!institution) return NextResponse.json({ error: 'Institution not found.' }, { status: 400 });
    let certificate;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        certificate = await db.$transaction(async transaction => {
          const created = await transaction.certificate.create({
            data: {
              certificateId: generateCertificateId(),
              recipientName: data.recipientName,
              recipientEmail: data.recipientEmail.toLowerCase(),
              courseName: data.courseName,
              certificateTitle: data.certificateTitle,
              description: data.description,
              institutionId,
              issueDate: new Date(`${data.issueDate}T00:00:00.000Z`),
              expiryDate: data.expiryDate ? new Date(`${data.expiryDate}T00:00:00.000Z`) : null,
              issuedById: auth.session.id
            }
          });
          await transaction.auditLog.create({
            data: {
              actorId: auth.session.id,
              action: 'CERTIFICATE_ISSUED',
              entityType: 'Certificate',
              entityId: created.id,
              details: JSON.stringify({ certificateId: created.certificateId })
            }
          });
          return created;
        });
        break;
      } catch (error) {
        if (error?.code !== 'P2002' || attempt === 2) throw error;
      }
    }

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    console.error('Certificate issue failed:', error);
    return NextResponse.json({ error: 'Unable to issue certificate. Please try again.' }, { status: 500 });
  }
}
