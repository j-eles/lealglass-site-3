import { createClient, type Client } from '@libsql/client';

/**
 * Cliente libsql (Turso) — leve, sem Prisma adapter overhead.
 *
 * Em desenvolvimento local com SQLite em arquivo, usa o driver libsql
 * com modo local (sem authToken).
 *
 * Em produção (Turso/Vercel), usa a URL + authToken das variáveis de ambiente.
 */
const globalForDb = globalThis as unknown as {
  db: Client | undefined;
};

function createDb(): Client {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL não definida. Configure no .env (dev) ou nas variáveis de ambiente da Vercel (prod).'
    );
  }

  // SQLite local em arquivo — libsql client suporta modo local
  if (databaseUrl.startsWith('file:')) {
    return createClient({ url: databaseUrl });
  }

  // Turso/Neon — precisa de authToken
  return createClient({
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// ────────────────────────────────────────────────────────────
// Helpers tipados para a tabela Lead
// ────────────────────────────────────────────────────────────

export type Lead = {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  project: string | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
};

export type NewLead = {
  name: string;
  company?: string | null;
  phone: string;
  email?: string | null;
  project?: string | null;
  message?: string | null;
  source?: string;
};

/**
 * Cria um novo lead no banco. Gera id (cuid-like) e timestamp automaticamente.
 */
export async function createLead(data: NewLead): Promise<string> {
  const id = generateId();
  await db.execute({
    sql: `INSERT INTO "Lead" (id, name, company, phone, email, project, message, source, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'))`,
    args: [
      id,
      data.name,
      data.company ?? null,
      data.phone,
      data.email ?? null,
      data.project ?? null,
      data.message ?? null,
      data.source ?? 'website',
    ],
  });
  return id;
}

/**
 * Lista leads ordenados por data de criação (mais recentes primeiro).
 */
export async function listLeads(limit = 100): Promise<Lead[]> {
  const result = await db.execute({
    sql: `SELECT * FROM "Lead" ORDER BY createdAt DESC LIMIT ?`,
    args: [limit],
  });
  return result.rows as unknown as Lead[];
}

/**
 * Conta leads por status.
 */
export async function countLeads(): Promise<number> {
  const result = await db.execute(`SELECT COUNT(*) as total FROM "Lead"`);
  const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
  return Number(row?.total ?? 0);
}

// ────────────────────────────────────────────────────────────
// ID generator (cuid-like, sem dependência externa)
// ────────────────────────────────────────────────────────────
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `cm${timestamp}${random}`;
}
