import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/login')) return NextResponse.next();

  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

  
    if (pathname.startsWith('/superadmin') && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }


    if (pathname.startsWith('/admin') && !['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/cashier', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/cashier/:path*', '/admin/:path*', '/superadmin/:path*'],
};