/**
 * Script de setup: cria tabelas no Turso e usuário admin inicial.
 *
 * Rodar uma vez após configurar DATABASE_URL, DATABASE_AUTH_TOKEN e ADMIN_SECRET no .env.
 *
 * Uso: bun run scripts/setup-turso.ts
 *
 * Para criar usuários admin adicionais (até 4):
 *   bun run scripts/setup-turso.ts --add-user=email@lealglass.com.br:Nome:senha
 */
import { createClient } from '@libsql/client';
import { createHash } from 'crypto';

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
const adminSecret = process.env.ADMIN_SECRET;

if (!url || !token) {
  console.error('❌ TURSO_DATABASE_URL e TURSO_AUTH_TOKEN devem estar definidos no .env');
  process.exit(1);
}

if (!adminSecret) {
  console.error('❌ ADMIN_SECRET deve estar definido no .env (usado para hash de senhas)');
  process.exit(1);
}

// Remove authToken da query string se existir (passamos separado)
const cleanUrl = url.split('?')[0];

const client = createClient({
  url: cleanUrl,
  authToken: token,
});

function hashPassword(password: string): string {
  return createHash('sha256').update(`${adminSecret}:${password}`).digest('hex');
}

function generateId(): string {
  return `cm${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

async function setup() {
  console.log('🔗 Conectando ao Turso:', cleanUrl);
  console.log('');

  // ════════════════════════════════════════════════════════════
  // 1. Tabela Lead (atualizada com novos campos)
  // ════════════════════════════════════════════════════════════
  console.log('📦 Criando/atualizando tabela Lead...');

  // SQLite não suporta ADD COLUMN IF NOT EXISTS de forma elegante,
  // então tentamos uma operação idempotente.
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
      "assignedTo" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "readAt" DATETIME
    );
  `);
  console.log('   ✅ Tabela Lead criada (ou já existia)');

  // Tenta adicionar colunas novas (ignora erro se já existirem)
  const newColumns = ['assignedTo TEXT', 'updatedAt DATETIME', 'readAt DATETIME'];
  for (const col of newColumns) {
    try {
      await client.execute(`ALTER TABLE "Lead" ADD COLUMN ${col};`);
      console.log(`   ✅ Coluna adicionada: ${col.split(' ')[0]}`);
    } catch (e) {
      // Coluna já existe — tudo certo
    }
  }

  await client.execute(`
    CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");
  `);
  console.log('   ✅ Índices criados');

  // ════════════════════════════════════════════════════════════
  // 2. Tabela AdminUser
  // ════════════════════════════════════════════════════════════
  console.log('');
  console.log('👤 Criando tabela AdminUser...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "AdminUser" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'admin',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastLoginAt" DATETIME
    );
  `);
  console.log('   ✅ Tabela AdminUser criada');

  // ════════════════════════════════════════════════════════════
  // 3. Tabela DeviceToken
  // ════════════════════════════════════════════════════════════
  console.log('');
  console.log('📱 Criando tabela DeviceToken...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "DeviceToken" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "userEmail" TEXT NOT NULL,
      "userAgent" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastUsedAt" DATETIME,
      "active" INTEGER NOT NULL DEFAULT 1
    );
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS "DeviceToken_userEmail_idx" ON "DeviceToken"("userEmail");
  `);
  console.log('   ✅ Tabela DeviceToken criada');

  // ════════════════════════════════════════════════════════════
  // 4. Cria usuário admin inicial (se não houver nenhum)
  // ════════════════════════════════════════════════════════════
  console.log('');
  console.log('🔑 Verificando usuários admin...');

  const existingUsers = await client.execute(`SELECT COUNT(*) as total FROM "AdminUser"`);
  const totalAdmins = Number((existingUsers.rows[0] as any)?.total ?? 0);

  if (totalAdmins === 0) {
    const adminEmail = 'admin@lealglass.com.br';
    const adminPassword = 'lealglass2025'; // ⚠️ TROCAR APÓS PRIMEIRO LOGIN
    const adminName = 'Administrador';

    const id = generateId();
    const passwordHash = hashPassword(adminPassword);

    await client.execute({
      sql: `INSERT INTO "AdminUser" (id, email, name, passwordHash, role, createdAt)
            VALUES (?, ?, ?, ?, 'super', datetime('now'))`,
      args: [id, adminEmail, adminName, passwordHash],
    });

    console.log('   ✅ Usuário admin inicial criado:');
    console.log(`      📧 Email:    ${adminEmail}`);
    console.log(`      🔒 Senha:    ${adminPassword}`);
    console.log('      ⚠️  TROQUE ESTA SENHA IMEDIATAMENTE após o primeiro login.');
  } else {
    console.log(`   ℹ️  ${totalAdmins} usuário(s) admin já existem — pulando criação.`);
  }

  // ════════════════════════════════════════════════════════════
  // 5. Adiciona usuários extras via CLI (opcional)
  // ════════════════════════════════════════════════════════════
  const addUserArg = process.argv.find((a) => a.startsWith('--add-user='));
  if (addUserArg) {
    const spec = addUserArg.replace('--add-user=', '');
    const [email, name, password] = spec.split(':');
    if (email && name && password) {
      try {
        const id = generateId();
        await client.execute({
          sql: `INSERT INTO "AdminUser" (id, email, name, passwordHash, role, createdAt)
                VALUES (?, ?, ?, ?, 'admin', datetime('now'))`,
          args: [id, email.toLowerCase(), name, hashPassword(password)],
        });
        console.log(`   ✅ Usuário adicionado: ${email}`);
      } catch (e: any) {
        console.error(`   ❌ Erro ao adicionar ${email}:`, e.message);
      }
    } else {
      console.error('   ❌ Formato inválido. Use: --add-user=email:Nome:senha');
    }
  }

  // ════════════════════════════════════════════════════════════
  // 6. Relatório final
  // ════════════════════════════════════════════════════════════
  console.log('');
  console.log('════════════════════════════════════════════════════════');
  console.log('📋 SETUP COMPLETO!');
  console.log('════════════════════════════════════════════════════════');
  console.log('');

  const tables = await client.execute(`SELECT name FROM sqlite_master WHERE type='table';`);
  console.log('📋 Tabelas:', tables.rows.map((r) => (r as any).name).join(', '));

  const leadCount = await client.execute(`SELECT COUNT(*) as total FROM "Lead"`);
  console.log(`📊 Leads existentes: ${(leadCount.rows[0] as any).total}`);

  const adminCount = await client.execute(`SELECT COUNT(*) as total FROM "AdminUser"`);
  console.log(`👤 Usuários admin: ${(adminCount.rows[0] as any).total}`);

  console.log('');
  console.log('🚀 Próximos passos:');
  console.log('   1. Acesse /admin/login e entre com o email/senha');
  console.log('   2. Acesse /admin/pedidos para ver os pedidos');
  console.log('   3. No celular, ative as notificações push');
  console.log('   4. Para adicionar mais usuários (até 4):');
  console.log('      bun run scripts/setup-turso.ts --add-user=joao@lealglass.com.br:João:senha123');
  console.log('');

  process.exit(0);
}

setup().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
