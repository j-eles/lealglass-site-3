import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * Limpa o cookie de sessão.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('lg_session');
  return response;
}
