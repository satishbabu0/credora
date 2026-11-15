import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = await db.user.findUnique({ where: { id: auth.session.id } });
  const institutions = auth.session.role === 'SUPER_ADMIN'
    ? await db.institution.findMany({ orderBy: { name: 'asc' } })
    : user?.institutionId ? await db.institution.findMany({ where: { id: user.institutionId } }) : [];
  return NextResponse.json({ institutions });
}
