/**
 * Script de setup: cria a tabela Lead no Turso (libsql).
 * Rodar uma vez após configurar DATABASE_URL e DATABASE_AUTH_TOKEN.
 *
 * Uso: bun run scripts/setup-turso.ts
 */
import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL;
const token = process.env.DATABASE_AUTH_TOKEN;

if (!url || !token) {
  console.error('❌ DATABASE_URL e DATABASE_AUTH_TOKEN devem estar definidos no .env');
  process.exit(1);
}

// Remove authToken da query string se existir (passamos separado)
const cleanUrl = url.split('?')[0];

const client = createClient({
  url: cleanUrl,
  authToken: token,
});

async function setup() {
  console.log('🔗 Conectando ao Turso:', cleanUrl);

  // Cria a tabela Lead (mesmo schema do Prisma)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Lead" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "company" TEXT,
      "phone" TEXT NOT NULL,
      "email" TEXT,
      "project" TEXT,
      "message" TEXT,
      "source" TEXT NOT NULL DEFAULT 'website',
      "status" TEXT NOT NULL DEFAULT 'new',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela Lead criada (ou já existia)');

  // Cria índice para createdAt (queries ordenadas por data)
  await client.execute(`
    CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
  `);
  console.log('✅ Índice createdAt criado');

  // Verifica
  const result = await client.execute(`SELECT name FROM sqlite_master WHERE type='table';`);
  console.log('📋 Tabelas no banco:', result.rows.map((r) => r.name));

  // Conta leads existentes
  const count = await client.execute(`SELECT COUNT(*) as total FROM "Lead";`);
  console.log('📊 Leads existentes:', count.rows[0].total);

  process.exit(0);
}

setup().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
