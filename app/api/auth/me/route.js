import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
export async function GET() {
  const auth = await requireUser();
  if (auth.error) return NextResponse.json({ user: null }, { status: auth.status });
  return NextResponse.json({ user: auth.session });
}
