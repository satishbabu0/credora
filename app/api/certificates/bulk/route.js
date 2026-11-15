import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCertificateId } from '@/lib/certificate';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const dateOnly = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(value => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  });

const rowSchema = z.object({
  recipientName: z.string().trim().min(2).max(120),
  recipientEmail: z.string().trim().email().max(160),
  courseName: z.string().trim().min(2).max(160),
  certificateTitle: z.preprocess(
    value => value === '' || value === null ? undefined : value,
    z.string().trim().min(2).max(160).default('Certificate of Achievement')
  ),
  issueDate: dateOnly,
  expiryDate: z.union([dateOnly, z.literal('')]).optional().transform(value => value || null),
  description: z.string().trim().max(2000).optional().transform(value => value || null)
}).superRefine((row, context) => {
  if (row.expiryDate && row.expiryDate < row.issueDate) {
    context.addIssue({ code: 'custom', path: ['expiryDate'], message: 'Expiry date cannot be before issue date.' });
  }
});

function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('Unterminated quoted field.');
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  const headers = (rows.shift() || []).map(value => value.replace(/^\uFEFF/, '').trim());
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    const { csv, institutionId } = body;
    if (typeof csv !== 'string' || csv.length > 2_000_000) return NextResponse.json({ error: 'Upload a CSV file smaller than 2 MB.' }, { status: 400 });
    const targetInstitution = auth.session.role === 'SUPER_ADMIN' ? institutionId : auth.session.institutionId;
    if (!targetInstitution || !(await db.institution.findUnique({ where: { id: targetInstitution } }))) return NextResponse.json({ error: 'Choose a valid institution.' }, { status: 400 });
    let rows;
    try {
      rows = parseCSV(csv);
    } catch {
      return NextResponse.json({ error: 'The CSV file contains an unterminated quoted field.' }, { status: 400 });
    }
    if (!rows.length) return NextResponse.json({ error: 'CSV has no data rows.' }, { status: 400 });
    if (rows.length > 1000) return NextResponse.json({ error: 'Import is limited to 1,000 rows at a time.' }, { status: 400 });
    const created = [], errors = [];
    for (let index = 0; index < rows.length; index += 1) {
      const parsed = rowSchema.safeParse(rows[index]);
      if (!parsed.success) {
        errors.push({ row: index + 2, error: parsed.error.issues[0]?.message || 'Check the certificate details.' });
        continue;
      }
      const row = parsed.data;
      try {
        let certificate;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            certificate = await db.$transaction(async transaction => {
              const issued = await transaction.certificate.create({ data: {
                certificateId: generateCertificateId(),
                recipientName: row.recipientName,
                recipientEmail: row.recipientEmail.toLowerCase(),
                courseName: row.courseName,
                certificateTitle: row.certificateTitle,
                description: row.description,
                institutionId: targetInstitution,
                issueDate: new Date(`${row.issueDate}T00:00:00.000Z`),
                expiryDate: row.expiryDate ? new Date(`${row.expiryDate}T00:00:00.000Z`) : null,
                issuedById: auth.session.id
              }});
              await transaction.auditLog.create({ data: {
                actorId: auth.session.id,
                action: 'CERTIFICATE_ISSUED',
                entityType: 'Certificate',
                entityId: issued.id,
                details: JSON.stringify({ certificateId: issued.certificateId, source: 'BULK_IMPORT' })
              }});
              return issued;
            });
            break;
          } catch (error) {
            if (error?.code !== 'P2002' || attempt === 2) throw error;
          }
        }
        created.push(certificate.certificateId);
      } catch (error) {
        console.error(`Bulk certificate row ${index + 2} failed:`, error);
        errors.push({ row: index + 2, error: 'Could not create this certificate. Check the row and try again.' });
      }
    }
    return NextResponse.json({ created: created.length, certificateIds: created, errors });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Bulk upload failed.' }, { status: 500 }); }
}
