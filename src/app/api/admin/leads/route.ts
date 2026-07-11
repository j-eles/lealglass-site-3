import { NextRequest, NextResponse } from 'next/server';
import {
  listLeads,
  listLeadsByStatus,
  countLeadsByStatus,
  type LeadStatus,
} from '@/lib/db';
import { verifySessionToken } from '@/lib/session';

/**
 * GET /api/admin/leads?status=new&limit=100&offset=0
 *
 * Lista leads para o painel admin. Opcionalmente filtra por status.
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as LeadStatus | null;
    const limit = Math.min(
      500,
      Math.max(1, Number(searchParams.get('limit') ?? 100))
    );
    const offset = Math.max(0, Number(searchParams.get('offset') ?? 0));

    const validStatuses: LeadStatus[] = ['new', 'read', 'contacted', 'done'];

    const [leads, counts] = await Promise.all([
      status && validStatuses.includes(status)
        ? listLeadsByStatus(status, limit)
        : listLeads(limit, offset),
      countLeadsByStatus(),
    ]);

    return NextResponse.json({
      leads,
      counts,
      user: { email: session.email, name: session.name, role: session.role },
    });
  } catch (err) {
    console.error('[ADMIN/LEADS] GET error:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar leads.' },
      { status: 500 }
    );
  }
}
