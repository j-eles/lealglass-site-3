import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/session';

/**
 * Middleware de proteção das rotas /admin/*.
 *
 * Verifica cookie de sessão assinado. Se inválido ou ausente,
 * redireciona para /admin/login.
 *
 * Não protege a própria /admin/login.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Só atua em /admin (exceto /admin/login)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('lg_session')?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protege todas as rotas /admin exceto /admin/login
  matcher: ['/admin/:path*'],
};
