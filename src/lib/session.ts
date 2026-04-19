import { cookies } from 'next/headers';
import { encrypt, decrypt } from './jwt';

export type SessionPayload = {
  userId: string;
  role: 'admin' | 'hr' | 'client';
  name: string;
  email: string;
  expiresAt: Date;
};

export { encrypt, decrypt };

export async function createSession(user: {
  id: string;
  role: 'admin' | 'hr' | 'client';
  name: string;
  email: string;
}) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  return decrypt(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
