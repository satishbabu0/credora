import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
    const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
    }
    await createSession(user);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Unable to sign in. Check the database connection.' }, { status: 500 });
  }
}
