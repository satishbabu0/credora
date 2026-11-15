import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const COOKIE_NAME = 'credora_session';
const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET must be configured with at least 32 characters.');
  }
  return new TextEncoder().encode(value);
};

export async function createSession(user) {
  const token = await new SignJWT({ sub: user.id, role: user.role, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function getSession() {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return { id: payload.sub, role: payload.role, email: payload.email, name: payload.name };
  } catch { return null; }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return { error: 'Authentication required', status: 401 };
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, institutionId: true }
  });
  if (!user) return { error: 'Authentication required', status: 401 };
  return { session: user };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.error) return result;
  if (!['SUPER_ADMIN', 'INSTITUTION_ADMIN'].includes(result.session.role)) return { error: 'Administrator access required', status: 403 };
  if (result.session.role === 'INSTITUTION_ADMIN' && !result.session.institutionId) {
    return { error: 'Your administrator account is not assigned to an institution.', status: 403 };
  }
  return result;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({ where: { id: session.id }, include: { institution: true } });
}
