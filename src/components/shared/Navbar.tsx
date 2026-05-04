import { headers } from 'next/headers';
import { getSession } from '@/lib/session';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const session = await getSession();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // Ẩn navbar khi đang trong trang quản lý riêng (có sidebar)
  if (session?.role === 'admin' && pathname.startsWith('/admin')) return null;
  if (session?.role === 'hr' && pathname.startsWith('/hr')) return null;

  return (
    <NavbarClient
      session={session ? { name: session.name, role: session.role } : null}
    />
  );
}
