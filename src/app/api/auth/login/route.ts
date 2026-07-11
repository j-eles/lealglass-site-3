import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminByEmail,
  verifyPassword,
  touchAdminLogin,
} from '@/lib/db';
import { createSessionToken, verifySessionToken } from '@/lib/session';

/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 *
 * Valida credenciais contra a tabela AdminUser no Turso.
 * Se OK, cria cookie de sessão assinado (httpOnly, secure, 7 dias).
 *
 * Retorna: { ok: true, user: { email, name, role } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      password?: unknown;
    };

    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password =
      typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const admin = await getAdminByEmail(email);
    if (!admin) {
      // Não revela se o email existe ou não — delay artificial anti-timing
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    await touchAdminLogin(email);

    const token = await createSessionToken({
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      ok: true,
      user: { email: admin.email, name: admin.name, role: admin.role },
    });

    // Cookie httpOnly — 7 dias, secure em produção, sameSite lax
    response.cookies.set('lg_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('[AUTH] login error:', err);
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login — verifica se a sessão atual é válida.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('lg_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    user: { email: session.email, name: session.name, role: session.role },
  });
}
