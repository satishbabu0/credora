import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const dateOnly = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(value => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  });

const updateSchema = z.object({
  status: z.literal('REVOKED').optional(),
  reason: z.string().trim().min(3).max(1000).optional(),
  recipientName: z.string().trim().min(2).max(120).optional(),
  recipientEmail: z.string().trim().email().max(160).transform(value => value.toLowerCase()).optional(),
  courseName: z.string().trim().min(2).max(160).optional(),
  certificateTitle: z.string().trim().min(2).max(160).optional(),
  description: z.union([z.string().trim().max(2000), z.literal(''), z.null()])
    .transform(value => value || null).optional(),
  expiryDate: z.union([dateOnly, z.literal(''), z.null()])
    .transform(value => value || null).optional()
}).strict().superRefine((data, context) => {
  if (data.status === 'REVOKED' && !data.reason) {
    context.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is required to revoke a certificate.' });
  }
  if (data.status !== 'REVOKED' && data.reason) {
    context.addIssue({ code: 'custom', path: ['reason'], message: 'A reason is only accepted when revoking a certificate.' });
  }
  const hasEditableField = Object.entries(data)
    .some(([key, value]) => key !== 'status' && key !== 'reason' && value !== undefined);
  if (data.status === 'REVOKED' && hasEditableField) {
    context.addIssue({ code: 'custom', message: 'Update certificate details separately from revocation.' });
  }
  if (data.status !== 'REVOKED' && !hasEditableField) {
    context.addIssue({ code: 'custom', message: 'Provide at least one certificate field to update.' });
  }
});

async function updateCertificate(id, auth, body) {
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Check the certificate update.' }, { status: 400 });
  }
  const data = parsed.data;
  const current = await db.certificate.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
  if (auth.session.role === 'INSTITUTION_ADMIN' && current.institutionId !== auth.session.institutionId) {
    return NextResponse.json({ error: 'You cannot manage certificates from another institution.' }, { status: 403 });
  }

  const revoking = data.status === 'REVOKED';
  if (revoking && current.status === 'REVOKED') {
    return NextResponse.json({ error: 'This certificate has already been revoked.' }, { status: 409 });
  }

  const { status, reason, ...updates } = data;
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) delete updates[key];
  }
  if (updates.expiryDate !== undefined) {
    updates.expiryDate = updates.expiryDate ? new Date(`${updates.expiryDate}T00:00:00.000Z`) : null;
  }
  if (updates.expiryDate && updates.expiryDate < current.issueDate) {
    return NextResponse.json({ error: 'Expiry date cannot be before the issue date.' }, { status: 400 });
  }
  if (current.status === 'REVOKED' && !revoking) {
    return NextResponse.json({ error: 'Revoked certificates cannot be edited or reactivated.' }, { status: 409 });
  }

  try {
    const result = await db.$transaction(async transaction => {
      if (revoking) {
        const updated = await transaction.certificate.updateMany({
          where: { id, status: { not: 'REVOKED' } },
          data: { status: 'REVOKED', revocationReason: reason, revokedAt: new Date() }
        });
        if (!updated.count) return null;
      } else {
        const updated = await transaction.certificate.updateMany({
          where: { id, status: { not: 'REVOKED' } },
          data: updates
        });
        if (!updated.count) return null;
      }

      const certificate = await transaction.certificate.findUnique({ where: { id } });
      await transaction.auditLog.create({
        data: {
          actorId: auth.session.id,
          action: revoking ? 'CERTIFICATE_REVOKED' : 'CERTIFICATE_UPDATED',
          entityType: 'Certificate',
          entityId: id,
          details: JSON.stringify(revoking ? { reason } : { changedFields: Object.keys(updates) })
        }
      });
      return certificate;
    });

    if (!result) return NextResponse.json({ error: 'This certificate has already been revoked.' }, { status: 409 });
    return NextResponse.json({ certificate: result });
  } catch (error) {
    console.error('Certificate update failed:', error);
    return NextResponse.json({ error: 'Could not update the certificate.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const { id } = await params;
  return updateCertificate(id, auth, body);
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'A revocation reason is required.' }, { status: 400 });
  }
  const { id } = await params;
  const reason = body && typeof body.reason === 'string' ? body.reason : '';
  return updateCertificate(id, auth, { status: 'REVOKED', reason });
}
