#!/usr/bin/env python3
"""
Gera arquivo .txt com todas as env vars COMPLETAS para Vercel.
Sem truncamento, sem redaction.
"""
from pathlib import Path

# Lê o .env atual
env_path = Path("/home/z/my-project/.env")
lines = env_path.read_text().split("\n")

# Variáveis que devem ir para a Vercel (filtros)
import re
included_keys = []
vars_dict = {}
for line in lines:
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    m = re.match(r"^([A-Z_][A-Z0-9_]*)=(.+)$", line)
    if not m:
        continue
    key, value = m.group(1), m.group(2)
    # Filtro: só variáveis relevantes para produção
    if re.match(r"^(NEXT_PUBLIC_|TURSO_|FIREBASE_|ADMIN_SECRET$|DATABASE_URL$|DATABASE_AUTH_TOKEN$)", key):
        vars_dict[key] = value
        included_keys.append(key)

# Gera o arquivo .txt final
output = []
output.append("# ═══════════════════════════════════════════════════════════════")
output.append("# LEAL GLASS — Variáveis de Ambiente para VERCEL")
output.append("# ═══════════════════════════════════════════════════════════════")
output.append("#")
output.append("# COMO USAR:")
output.append("# 1. Acesse https://vercel.com → seu projeto → Settings → Environment Variables")
output.append("# 2. Para cada variável abaixo, clique em \"Add New\" e preencha:")
output.append("#    - Name: nome da variável (texto antes do =)")
output.append("#    - Value: valor (texto depois do =)")
output.append("#    - Environments: marque Production, Preview E Development")
output.append("# 3. Após adicionar TODAS, faça Redeploy")
output.append("#")
output.append("# ALTERNATIVA: Use o arquivo vercel-env.json (neste mesmo diretório)")
output.append("# e importe via Vercel CLI: vercel env import vercel-env.json")
output.append("#")
output.append("# TOTAL DE VARIÁVEIS: " + str(len(vars_dict)))
output.append("# ═══════════════════════════════════════════════════════════════")
output.append("")
output.append("")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("# 1. BANCO DE DADOS — TURSO (libsql)")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("")
output.append(f"TURSO_DATABASE_URL={vars_dict.get('TURSO_DATABASE_URL', '')}")
output.append("")
output.append(f"TURSO_AUTH_TOKEN={vars_dict.get('TURSO_AUTH_TOKEN', '')}")
output.append("")
output.append(f"DATABASE_URL={vars_dict.get('DATABASE_URL', '')}")
output.append("")
output.append(f"DATABASE_AUTH_TOKEN={vars_dict.get('DATABASE_AUTH_TOKEN', '')}")
output.append("")
output.append("")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("# 2. FIREBASE CLOUD MESSAGING — CLIENT-SIDE (NEXT_PUBLIC_*)")
output.append("#    Essas são PÚBLICAS — podem ser expostas no navegador")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("")
output.append(f"NEXT_PUBLIC_FIREBASE_API_KEY={vars_dict.get('NEXT_PUBLIC_FIREBASE_API_KEY', '')}")
output.append("")
output.append(f"NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN={vars_dict.get('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', '')}")
output.append("")
output.append(f"NEXT_PUBLIC_FIREBASE_PROJECT_ID={vars_dict.get('NEXT_PUBLIC_FIREBASE_PROJECT_ID', '')}")
output.append("")
output.append(f"NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET={vars_dict.get('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', '')}")
output.append("")
output.append(f"NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID={vars_dict.get('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '')}")
output.append("")
output.append(f"NEXT_PUBLIC_FIREBASE_APP_ID={vars_dict.get('NEXT_PUBLIC_FIREBASE_APP_ID', '')}")
output.append("")
output.append(f"NEXT_PUBLIC_FIREBASE_VAPID_KEY={vars_dict.get('NEXT_PUBLIC_FIREBASE_VAPID_KEY', '')}")
output.append("")
output.append("")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("# 3. FIREBASE ADMIN SDK — SERVER-SIDE (SECRETAS)")
output.append("#    NÃO usar prefixo NEXT_PUBLIC_")
output.append("#    A private key está em base64 (codificada)")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("")
output.append(f"FIREBASE_CLIENT_EMAIL={vars_dict.get('FIREBASE_CLIENT_EMAIL', '')}")
output.append("")
output.append(f"FIREBASE_PRIVATE_KEY_B64={vars_dict.get('FIREBASE_PRIVATE_KEY_B64', '')}")
output.append("")
output.append("")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("# 4. AUTENTICAÇÃO ADMIN — HASH DE SENHAS + COOKIE DE SESSÃO")
output.append("#")
output.append("# ⚠️ IMPORTANTE: Após mudar este valor, é preciso recriar os usuários")
output.append("#    admin no Turso, pois os hashes de senha são derivados deste secret.")
output.append("#    Comando: bun run scripts/setup-turso.ts --add-user=email:Nome:senha")
output.append("#")
output.append("# Para gerar um novo secret aleatório e seguro:")
output.append("#    openssl rand -hex 32")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("")
output.append(f"ADMIN_SECRET={vars_dict.get('ADMIN_SECRET', '')}")
output.append("")
output.append("")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("# 5. URL PÚBLICA DO SITE")
output.append("# ────────────────────────────────────────────────────────────────")
output.append("")
output.append(f"NEXT_PUBLIC_SITE_URL={vars_dict.get('NEXT_PUBLIC_SITE_URL', '')}")
output.append("")
output.append("")
output.append("# ═══════════════════════════════════════════════════════════════")
output.append("# CHECKLIST FINAL")
output.append("# ═══════════════════════════════════════════════════════════════")
output.append("#")
output.append("# [ ] 1. Todas as 15 variáveis acima cadastradas na Vercel")
output.append("# [ ] 2. FIREBASE_PRIVATE_KEY_B64 com valor COMPLETO (2272 caracteres)")
output.append("# [ ] 3. ADMIN_SECRET trocado por valor aleatório seguro")
output.append("# [ ] 4. Após mudar ADMIN_SECRET, recriar usuários admin:")
output.append("#         bun run scripts/setup-turso.ts --add-user=...")
output.append("# [ ] 5. Fazer Redeploy na Vercel")
output.append("# [ ] 6. Acessar /admin/login no Chrome Android")
output.append("# [ ] 7. Logar, ativar notificações, instalar PWA")
output.append("# [ ] 8. Testar: preencher formulário do site → push deve chegar")
output.append("#")
output.append("# ═══════════════════════════════════════════════════════════════")

# Escreve o arquivo final
output_path = Path("/home/z/my-project/download/vercel-env-vars.txt")
output_path.write_text("\n".join(output))

# Verificação
content = output_path.read_text()
print(f"✅ Arquivo gerado: {output_path}")
print(f"   Tamanho: {len(content)} chars")
print(f"   Linhas: {len(content.split(chr(10)))}")
print(f"   Variáveis incluídas: {len(vars_dict)}")

# Verifica se FIREBASE_PRIVATE_KEY_B64 não está truncado
for line in content.split("\n"):
    if line.startswith("FIREBASE_PRIVATE_KEY_B64="):
        value = line.split("=", 1)[1]
        print(f"   FIREBASE_PRIVATE_KEY_B64 length: {len(value)} (esperado: 2272)")
        if len(value) == 2272:
            print("   ✅ Valor COMPLETO (não truncado)")
        else:
            print("   ❌ Valor truncado!")
        break
