import { db } from '@/lib/db';
import { resolveStatus } from '@/lib/certificate';

export async function verifyPublicCertificate(certificateId, method) {
  if (typeof certificateId !== 'string' || !certificateId || certificateId.length > 160) {
    return { status: 'NOT_FOUND', certificate: null };
  }

  const certificate = await db.certificate.findUnique({
    where: { certificateId },
    select: {
      id: true,
      certificateId: true,
      recipientName: true,
      courseName: true,
      issueDate: true,
      expiryDate: true,
      status: true,
      institution: { select: { name: true } }
    }
  });

  if (!certificate) return { status: 'NOT_FOUND', certificate: null };

  const status = resolveStatus(certificate.status, certificate.expiryDate);
  await db.verificationLog.create({
    data: { certificateId: certificate.id, result: status, method }
  });

  return {
    status,
    certificate: {
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      institution: certificate.institution.name,
      courseName: certificate.courseName,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate
    }
  };
}
