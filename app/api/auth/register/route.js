import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(100)
});

export async function POST(request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Enter a valid name, email and password (at least 8 characters).' }, { status: 400 });
    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const exists = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    const institution = await db.institution.findFirst({ orderBy: { createdAt: 'asc' } });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name, email: normalizedEmail, passwordHash, role: 'STUDENT', institutionId: institution?.id || null }
    });
    await createSession(user);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Registration failed. Check the database connection and try again.' }, { status: 500 });
  }
}
