import { NextRequest, NextResponse } from 'next/server';
import { upsertDeviceToken, deactivateDeviceToken } from '@/lib/db';
import { verifySessionToken } from '@/lib/session';

/**
 * POST /api/device-tokens
 *
 * Registra (ou reativa) um device token FCM para o usuário autenticado.
 * Body: { token, userAgent? }
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica sessão
    const sessionToken = request.cookies.get('lg_session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Não autenticado.' },
        { status: 401 }
      );
    }
    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão expirada.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      token?: unknown;
      userAgent?: unknown;
    };

    const token =
      typeof body.token === 'string' ? body.token.trim() : '';
    if (!token || token.length < 20) {
      return NextResponse.json(
        { error: 'Token FCM inválido.' },
        { status: 400 }
      );
    }

    const userAgent =
      typeof body.userAgent === 'string' ? body.userAgent : null;

    await upsertDeviceToken(token, session.email, userAgent);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DEVICE-TOKENS] POST error:', err);
    return NextResponse.json(
      { error: 'Erro ao registrar token.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/device-tokens
 *
 * Desativa um device token (quando usuário faz logout).
 * Body: { token }
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('lg_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ ok: true }); // idempotente
    }
    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ ok: true });
    }

    const body = (await request.json().catch(() => ({}))) as {
      token?: unknown;
    };
    const token = typeof body.token === 'string' ? body.token : '';
    if (!token) {
      return NextResponse.json(
        { error: 'Token obrigatório.' },
        { status: 400 }
      );
    }

    await deactivateDeviceToken(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DEVICE-TOKENS] DELETE error:', err);
    return NextResponse.json(
      { error: 'Erro ao desativar token.' },
      { status: 500 }
    );
  }
}
