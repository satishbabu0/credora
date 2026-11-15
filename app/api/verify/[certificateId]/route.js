import { NextResponse } from 'next/server';
import { verifyPublicCertificate } from '@/lib/verification';

export async function GET(request, { params }) {
  try {
    const { certificateId } = await params;
    if (!certificateId || certificateId.length > 160) {
      return NextResponse.json({ valid: false, status: 'NOT_FOUND', message: 'Certificate not found.' }, { status: 404 });
    }

    const result = await verifyPublicCertificate(certificateId, 'ID_LOOKUP');
    if (!result.certificate) {
      return NextResponse.json({ valid: false, status: result.status, message: 'Certificate not found.' }, { status: 404 });
    }
    return NextResponse.json({
      valid: result.status === 'VALID',
      status: result.status,
      certificate: result.certificate
    });
  } catch (error) {
    console.error('Verification API failed:', error);
    return NextResponse.json({ error: 'Verification service is temporarily unavailable.' }, { status: 500 });
  }
}
