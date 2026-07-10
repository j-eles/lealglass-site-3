# Leal Glass — Site Institucional

Site institucional premium da **Leal Glass Esquadrias Ltda** (CNPJ 30.624.485/0001-55), empresa de fachadas e esquadrias de alumínio de alto padrão em Curitiba — PR.

## 🚀 Deploy na Vercel

### Pré-requisitos
- Conta no GitHub
- Conta na Vercel (https://vercel.com)
- Banco Turso já configurado (URL + token)

### Passo a passo

1. **Criar repositório no GitHub**
   - Crie um repo público ou privado chamado `lealglass`
   - Faça upload de todos os arquivos deste pacote (não inclua `.env`)

2. **Importar na Vercel**
   - Acesse https://vercel.com/new
   - Escolha "Import Git Repository" → selecione `lealglass`
   - Framework Preset: Next.js (auto-detectado)

3. **Configurar variáveis de ambiente**
   Na seção "Environment Variables", adicione:
   ```
   DATABASE_URL = libsql://lealglass-j-eles.aws-us-west-2.turso.io
   DATABASE_AUTH_TOKEN = (seu token Turso)
   ```
   Marque ambas para Production e Preview.

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-4 minutos (build ~20s + CDN upload)
   - Site no ar em `https://lealglass.vercel.app`

5. **Criar tabela no banco (uma vez)**
   Após o primeiro deploy, rode localmente:
   ```bash
   bun install
   bun run db:setup-turso
   ```
   (Configura `.env` com `DATABASE_URL` e `DATABASE_AUTH_TOKEN` antes)

6. **Domínio próprio (opcional)**
   - Vercel → Settings → Domains → adicione `lealglass.com.br`
   - Configure DNS no registrador conforme instruções da Vercel

## 📋 Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                    # Landing page principal
│   ├── layout.tsx                  # Layout root + SEO + Schema.org
│   ├── globals.css                 # Design system (obsidian + gold)
│   ├── obrigado/page.tsx           # Thank you page pós-formulário
│   ├── politica-de-privacidade/    # Política LGPD
│   ├── api/leads/route.ts          # API captura leads (POST)
│   ├── sitemap.ts                  # Sitemap dinâmico
│   └── robots.ts                   # Robots.txt
├── components/ui/                  # shadcn/ui components
├── lib/db.ts                       # Cliente Turso (libsql)
└── hooks/                          # Hooks customizados

public/
├── obras-curated/                  # Fotos reais das obras (tratadas)
├── logo-navbar.png                 # Logo transparente (navbar/footer)
├── logo-retina.png                 # Logo 256px (Apple touch, schema.org)
├── favicon.png                     # Favicon 32px
└── hero-bg.jpeg                    # Fallback hero (não usado mais)

prisma/
└── schema.prisma                   # Schema do banco (documentação)

scripts/
└── setup-turso.ts                  # Script para criar tabela Lead no Turso
```

## 🛠️ Desenvolvimento local

```bash
# Instalar dependências
bun install

# Configurar .env (criar arquivo na raiz)
DATABASE_URL=file:./db/local.db   # SQLite local para dev

# Criar banco local
bun run db:setup-turso

# Rodar em desenvolvimento
bun run dev

# Build de produção (testar antes de push)
bun run build

# Lint
bun run lint
```

## 📊 Stack técnica

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Linguagem**: TypeScript 5
- **Estilo**: Tailwind CSS 4 + shadcn/ui (New York)
- **Banco**: Turso (libsql) — SQLite na edge
- **ORM**: Prisma 6 (schema apenas) + @libsql/client direto
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Fontes**: Cormorant Garamond + DM Sans + DM Mono (next/font)
- **Deploy**: Vercel

## 🔐 Segurança

- ✅ Honeypot field no formulário (anti-bot)
- ✅ Rate limiting: 5 req/min por IP
- ✅ Validação server-side (nome, telefone, email)
- ✅ Checkbox LGPD obrigatório (Lei 13.709/2018)
- ✅ `.env` no `.gitignore` (credenciais não vazam)
- ✅ Página de Política de Privacidade completa

## 📞 Contato da empresa

- **Razão social**: Leal Glass Esquadrias Ltda
- **CNPJ**: 30.624.485/0001-55
- **Endereço**: Rua Antonio Ribeiro Macedo, 295, Xaxim, Curitiba — PR, CEP 81.810-250
- **WhatsApp**: (41) 99851-2093
- **Telefone**: (41) 3057-0873
- **E-mail LGPD**: sistemas@lealglass.com.br

## 📝 Manutenção

Para atualizar o site:
1. Faça as alterações localmente
2. Teste com `bun run dev` e `bun run build`
3. Commit + push para o GitHub
4. Vercel faz redeploy automático em 2-4 minutos

Para mais detalhes, consulte o procedimento completo de atualização na documentação interna.
