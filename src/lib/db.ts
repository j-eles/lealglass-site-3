import { createClient, type Client } from '@libsql/client';
import { createHash, randomBytes } from 'crypto';

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
  // Prioridade: TURSO_DATABASE_URL > DATABASE_URL
  // (DATABASE_URL pode ser sobrescrito pelo ambiente de dev para SQLite local)
  const databaseUrl =
    process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'Banco de dados não configurado. Defina TURSO_DATABASE_URL no .env'
    );
  }

  // SQLite local em arquivo — libsql client suporta modo local
  if (databaseUrl.startsWith('file:')) {
    return createClient({ url: databaseUrl });
  }

  // Turso/Neon — precisa de authToken
  return createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN,
  });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// ────────────────────────────────────────────────────────────
// Helpers tipados para a tabela Lead
// ────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'read' | 'contacted' | 'done';

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
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
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
 * Retorna o lead completo criado (incluindo id), para uso no disparo de push.
 */
export async function createLead(data: NewLead): Promise<Lead> {
  const id = generateId();
  await db.execute({
    sql: `INSERT INTO "Lead" (id, name, company, phone, email, project, message, source, status, assignedTo, createdAt, updatedAt, readAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', NULL, datetime('now'), datetime('now'), NULL)`,
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
  // Busca o lead criado para retornar com timestamps corretos
  const created = await getLeadById(id);
  if (!created) {
    // Fallback: retorna um objeto com os dados que temos
    return {
      id,
      name: data.name,
      company: data.company ?? null,
      phone: data.phone,
      email: data.email ?? null,
      project: data.project ?? null,
      message: data.message ?? null,
      source: data.source ?? 'website',
      status: 'new',
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readAt: null,
    };
  }
  return created;
}

/**
 * Busca um lead pelo id.
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const result = await db.execute({
    sql: `SELECT * FROM "Lead" WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0];
  return row ? (row as unknown as Lead) : null;
}

/**
 * Lista leads ordenados por data de criação (mais recentes primeiro).
 */
export async function listLeads(limit = 100, offset = 0): Promise<Lead[]> {
  const result = await db.execute({
    sql: `SELECT * FROM "Lead" ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });
  return result.rows as unknown as Lead[];
}

/**
 * Lista leads filtrados por status.
 */
export async function listLeadsByStatus(
  status: LeadStatus,
  limit = 100
): Promise<Lead[]> {
  const result = await db.execute({
    sql: `SELECT * FROM "Lead" WHERE status = ? ORDER BY createdAt DESC LIMIT ?`,
    args: [status, limit],
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

/**
 * Conta leads agrupados por status — usado para badges na UI admin.
 */
export async function countLeadsByStatus(): Promise<
  Record<LeadStatus, number>
> {
  const result = await db.execute(
    `SELECT status, COUNT(*) as total FROM "Lead" GROUP BY status`
  );
  const counts: Record<LeadStatus, number> = {
    new: 0,
    read: 0,
    contacted: 0,
    done: 0,
  };
  for (const row of result.rows) {
    const r = row as unknown as { status: string; total: number };
    if (r.status in counts) {
      counts[r.status as LeadStatus] = Number(r.total);
    }
  }
  return counts;
}

/**
 * Atualiza status de um lead.
 */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  assignedTo?: string
): Promise<void> {
  if (status === 'read') {
    await db.execute({
      sql: `UPDATE "Lead" SET status = ?, updatedAt = datetime('now'), readAt = datetime('now')${
        assignedTo ? ', assignedTo = ?' : ''
      } WHERE id = ?`,
      args: assignedTo ? [status, assignedTo, id] : [status, id],
    });
    return;
  }
  await db.execute({
    sql: `UPDATE "Lead" SET status = ?, updatedAt = datetime('now')${
      assignedTo ? ', assignedTo = ?' : ''
    } WHERE id = ?`,
    args: assignedTo ? [status, assignedTo, id] : [status, id],
  });
}

// ────────────────────────────────────────────────────────────
// Helpers para AdminUser
// ────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
};

/**
 * Hash de senha usando SHA-256 com salt estático derivado do ADMIN_SECRET.
 * Simples mas suficiente para 4 usuários internos. Em produção com
 * requisitos de segurança maiores, migre para argon2/bcrypt.
 */
function hashPassword(password: string): string {
  const salt = process.env.ADMIN_SECRET || 'lealglass-salt-fallback';
  return createHash('sha256')
    .update(`${salt}:${password}`)
    .digest('hex');
}

/**
 * Verifica senha em texto plano contra o hash armazenado.
 */
export function verifyPassword(
  password: string,
  storedHash: string
): boolean {
  const computed = hashPassword(password);
  // comparação constante-time simples
  if (computed.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Busca admin por email.
 */
export async function getAdminByEmail(
  email: string
): Promise<AdminUser | null> {
  const result = await db.execute({
    sql: `SELECT * FROM "AdminUser" WHERE email = ? LIMIT 1`,
    args: [email.toLowerCase()],
  });
  const row = result.rows[0];
  return row ? (row as unknown as AdminUser) : null;
}

/**
 * Atualiza lastLoginAt do admin.
 */
export async function touchAdminLogin(email: string): Promise<void> {
  await db.execute({
    sql: `UPDATE "AdminUser" SET lastLoginAt = datetime('now') WHERE email = ?`,
    args: [email.toLowerCase()],
  });
}

/**
 * Cria um admin user (usado no script de setup inicial).
 */
export async function createAdminUser(
  email: string,
  name: string,
  password: string,
  role: 'admin' | 'super' = 'admin'
): Promise<void> {
  const id = generateId();
  const passwordHash = hashPassword(password);
  await db.execute({
    sql: `INSERT INTO "AdminUser" (id, email, name, passwordHash, role, createdAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    args: [id, email.toLowerCase(), name, passwordHash, role],
  });
}

// ────────────────────────────────────────────────────────────
// Helpers para DeviceToken (FCM)
// ────────────────────────────────────────────────────────────

export type DeviceToken = {
  id: string;
  token: string;
  userEmail: string;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  active: boolean;
};

/**
 * Registra (ou reativa) um device token FCM para um usuário.
 * Idempotente: se o token já existe, apenas reativa e atualiza userAgent.
 */
export async function upsertDeviceToken(
  token: string,
  userEmail: string,
  userAgent?: string
): Promise<void> {
  // Verifica se já existe
  const existing = await db.execute({
    sql: `SELECT id FROM "DeviceToken" WHERE token = ? LIMIT 1`,
    args: [token],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: `UPDATE "DeviceToken"
            SET userEmail = ?, userAgent = ?, active = 1, lastUsedAt = datetime('now')
            WHERE token = ?`,
      args: [userEmail.toLowerCase(), userAgent ?? null, token],
    });
    return;
  }

  const id = generateId();
  await db.execute({
    sql: `INSERT INTO "DeviceToken" (id, token, userEmail, userAgent, createdAt, lastUsedAt, active)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), 1)`,
    args: [id, token, userEmail.toLowerCase(), userAgent ?? null],
  });
}

/**
 * Lista todos os tokens ativos (para broadcast quando chega lead novo).
 * Opcionalmente filtra por userEmail.
 */
export async function listActiveDeviceTokens(
  userEmail?: string
): Promise<string[]> {
  if (userEmail) {
    const result = await db.execute({
      sql: `SELECT token FROM "DeviceToken" WHERE active = 1 AND userEmail = ?`,
      args: [userEmail.toLowerCase()],
    });
    return result.rows.map(
      (r) => (r as unknown as { token: string }).token
    );
  }

  const result = await db.execute(
    `SELECT token FROM "DeviceToken" WHERE active = 1`
  );
  return result.rows.map((r) => (r as unknown as { token: string }).token);
}

/**
 * Desativa um device token (quando usuário faz logout ou token expira).
 */
export async function deactivateDeviceToken(token: string): Promise<void> {
  await db.execute({
    sql: `UPDATE "DeviceToken" SET active = 0 WHERE token = ?`,
    args: [token],
  });
}

// ────────────────────────────────────────────────────────────
// Sessão — implementação em src/lib/session.ts (Web Crypto API,
// compatível com Edge Runtime do middleware)
// ────────────────────────────────────────────────────────────

// Re-export para compatibilidade com código existente
export {
  createSessionToken,
  verifySessionToken,
  type SessionData,
} from './session';

/**
 * Gera um ID tipo cuid (sem dependência externa).
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  const rand = randomBytes(4).toString('hex');
  return `cm${timestamp}${random}${rand}`;
}
