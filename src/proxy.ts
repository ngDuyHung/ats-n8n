import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/jwt';

// Routes không cần đăng nhập
const PUBLIC_ROUTES = ['/', '/login', '/register'];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Cho phép các route public và /jobs (browse + detail), nhưng KHÔNG gồm /jobs/*/apply
  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    (pathname.startsWith('/jobs') && !pathname.endsWith('/apply'));

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // Chưa đăng nhập mà vào route yêu cầu auth → redirect login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Đã đăng nhập mà vào trang login/register → redirect về trang chính
  if (session && (pathname === '/login' || pathname === '/register')) {
    if (session.role === 'admin') return NextResponse.redirect(new URL('/admin', req.nextUrl));
    if (session.role === 'hr') return NextResponse.redirect(new URL('/hr', req.nextUrl));
    return NextResponse.redirect(new URL('/jobs', req.nextUrl));
  }

  // Bảo vệ /admin/*: chỉ admin
  if (pathname.startsWith('/admin') && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Bảo vệ /hr/*: chỉ hr và admin
  if (
    pathname.startsWith('/hr') &&
    session?.role !== 'hr' &&
    session?.role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Bảo vệ /my-applications và /become-hr: phải đăng nhập
  if (
    (pathname.startsWith('/my-applications') || pathname.startsWith('/become-hr')) &&
    !session
  ) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // /become-hr chỉ dành cho client
  if (pathname.startsWith('/become-hr') && session?.role !== 'client') {
    if (session?.role === 'hr') return NextResponse.redirect(new URL('/hr', req.nextUrl));
    if (session?.role === 'admin') return NextResponse.redirect(new URL('/admin', req.nextUrl));
  }

  // Inject pathname vào request header để server components đọc
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
