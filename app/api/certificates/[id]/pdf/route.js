import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { resolveStatus } from '@/lib/certificate';

export const runtime = 'nodejs';

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value))
    : 'No expiry date';
}

export async function GET(request, { params }) {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const certificate = await db.certificate.findUnique({
    where: { id },
    include: { institution: { select: { name: true } } }
  });
  if (!certificate) return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });

  if (auth.session.role === 'STUDENT' && certificate.recipientEmail.toLowerCase() !== auth.session.email.toLowerCase()) {
    return NextResponse.json({ error: 'You can only download your own certificate.' }, { status: 403 });
  }
  if (auth.session.role === 'INSTITUTION_ADMIN' && certificate.institutionId !== auth.session.institutionId) {
    return NextResponse.json({ error: 'You cannot download certificates from another institution.' }, { status: 403 });
  }

  try {
    const base = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/+$/, '');
    const verificationUrl = `${base}/verify/${encodeURIComponent(certificate.certificateId)}`;
    const qr = await QRCode.toDataURL(verificationUrl, { width: 220, margin: 1, errorCorrectionLevel: 'H' });
    const image = Buffer.from(qr.split(',')[1], 'base64');
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 45,
      info: { Title: certificate.certificateTitle, Author: 'Credora' }
    });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    const finished = new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    doc.rect(22, 22, 798, 550).lineWidth(3).strokeColor('#0b7180').stroke();
    doc.rect(34, 34, 774, 526).lineWidth(1).strokeColor('#b9dce0').stroke();
    doc.fillColor('#073047').font('Helvetica-Bold').fontSize(17)
      .text(certificate.institution.name.toUpperCase(), 55, 62, { width: 730, align: 'center', height: 28 });
    doc.fillColor('#078c9b').fontSize(12)
      .text('CREDORA  |  DIGITAL CREDENTIAL', 55, 96, { width: 730, align: 'center' });
    doc.fillColor('#102b3b').font('Times-Bold').fontSize(20)
      .text(certificate.certificateTitle, 70, 126, { width: 700, align: 'center', height: 70, ellipsis: true });
    doc.fillColor('#526575').font('Helvetica').fontSize(14)
      .text('This is to certify that', 70, 207, { width: 700, align: 'center' });
    doc.fillColor('#073047').font('Times-BoldItalic').fontSize(22)
      .text(certificate.recipientName, 70, 235, { width: 700, align: 'center', height: 54, ellipsis: true });
    doc.fillColor('#526575').font('Helvetica').fontSize(14)
      .text('has successfully completed', 70, 298, { width: 700, align: 'center' });
    doc.fillColor('#073047').font('Helvetica-Bold').fontSize(17)
      .text(certificate.courseName, 70, 326, { width: 700, align: 'center', height: 46, ellipsis: true });

    if (certificate.description) {
      doc.fillColor('#526575').font('Helvetica').fontSize(10)
        .text(certificate.description, 80, 380, { width: 630, align: 'center', height: 38, ellipsis: true });
    }
    const status = resolveStatus(certificate.status, certificate.expiryDate);
    doc.fillColor('#526575').font('Helvetica').fontSize(10)
      .text(`Issued: ${formatDate(certificate.issueDate)}     Expires: ${formatDate(certificate.expiryDate)}`, 50, 422, { width: 630, align: 'center' });
    doc.text(`Certificate ID: ${certificate.certificateId}     Status: ${status}`, 50, 441, { width: 630, align: 'center' });
    doc.image(image, 715, 435, { width: 76, height: 76 });
    doc.fillColor('#526575').fontSize(8)
      .text('Scan to verify authenticity', 670, 516, { width: 150, align: 'center' });
    doc.end();
    await finished;

    const filename = certificate.certificateId.replace(/[^A-Z0-9._-]/gi, '_');
    return new NextResponse(Buffer.concat(chunks), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`
      }
    });
  } catch (error) {
    console.error('Certificate PDF generation failed:', error);
    return NextResponse.json({ error: 'Unable to generate the certificate PDF.' }, { status: 500 });
  }
}
