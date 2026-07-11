import { NextRequest, NextResponse } from 'next/server';
import {
  updateLeadStatus,
  type LeadStatus,
} from '@/lib/db';
import { verifySessionToken } from '@/lib/session';

/**
 * PATCH /api/admin/leads/[id]
 *
 * Atualiza status de um lead (e opcionalmente marca atendido por).
 * Body: { status: 'new' | 'read' | 'contacted' | 'done' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID do lead obrigatório.' },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      status?: unknown;
    };
    const status = body.status as LeadStatus | undefined;

    const validStatuses: LeadStatus[] = ['new', 'read', 'contacted', 'done'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Status inválido. Use: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // assignedTo só é setado automaticamente quando muda para "read" ou "contacted"
    const assignedTo =
      status === 'read' || status === 'contacted' ? session.email : undefined;

    await updateLeadStatus(id, status, assignedTo);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[ADMIN/LEADS] PATCH error:', err);
    return NextResponse.json(
      { error: 'Erro ao atualizar lead.' },
      { status: 500 }
    );
  }
}
