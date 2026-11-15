import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { certificateId } = await params;
  const certificate = await db.certificate.findUnique({ where: { certificateId }, select: { certificateId: true } });
  if (!certificate) return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
  const base = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/+$/, '');
  const target = `${base}/verify/${encodeURIComponent(certificateId)}`;
  const png = await QRCode.toBuffer(target, { type: 'png', width: 360, margin: 2, errorCorrectionLevel: 'H' });
  return new NextResponse(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' } });
}
