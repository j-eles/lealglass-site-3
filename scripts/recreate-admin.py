#!/usr/bin/env python3
"""
Recria o admin inicial no Turso com o novo ADMIN_SECRET.
Apaga o admin antigo (cujo hash foi gerado com secret diferente) e cria um novo.
"""
import subprocess
import os

# Carrega o novo ADMIN_SECRET do .env
env_path = "/home/z/my-project/.env"
with open(env_path) as f:
    for line in f:
        if line.startswith("ADMIN_SECRET="):
            new_secret = line.split("=", 1)[1].strip()
            break

print(f"Novo ADMIN_SECRET: {new_secret[:16]}...{new_secret[-8:]}")
print(f"Tamanho: {len(new_secret)} caracteres")
print()

# Define env vars para passar ao bun
env = os.environ.copy()
env["ADMIN_SECRET"] = new_secret
env["TURSO_DATABASE_URL"] = "libsql://lealglass-j-eles.aws-us-west-2.turso.io"
env["TURSO_AUTH_TOKEN"] = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM0MzA5MTIsImlkIjoiMDE5ZjNjYjItYjcwMS03OGYwLWEyYmUtYzIyMzdmNmM3YTY3Iiwia2lkIjoiV1N5NzZ4NEhFaGhXclpZWVVSR2NRZ0phdUdqcVAwZUhkTHlLTFg5TU9sMCIsInJpZCI6ImVlNDNhZmJhLTVlZTMtNDk1OC04MWIyLTcwNzJiNTQ5NWUyMiJ9.zZ54-QIhlKJrsvg7pDtV0fVqFXv01t6KCGWfrWeRes7vqpcQxW1tG0zNW4DSdS0TESH0UpvS8nWt88oVJxeUCA"

# 1. Apaga todos os admins existentes (hashes antigos não funcionam mais)
print("1. Apagando admin antigo (hash incompatível com novo secret)...")
result = subprocess.run(
    ["bun", "-e", """
import { createClient } from '@libsql/client';
const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const r = await c.execute('DELETE FROM "AdminUser"');
console.log('   Admins removidos:', r.rowsAffected);
"""],
    env=env,
    cwd="/home/z/my-project",
    capture_output=True,
    text=True
)
print(result.stdout)
if result.returncode != 0:
    print("ERRO:", result.stderr)
    exit(1)

# 2. Recria o admin com o novo secret (rodando o setup-turso.ts)
print("2. Recriando admin com novo ADMIN_SECRET...")
result = subprocess.run(
    ["bun", "run", "scripts/setup-turso.ts"],
    env=env,
    cwd="/home/z/my-project",
    capture_output=True,
    text=True
)
print(result.stdout[-1500:])  # últimos 1500 chars
if result.returncode != 0:
    print("ERRO:", result.stderr)
    exit(1)

print()
print("✅ Admin recriado com sucesso!")
print("   Email: admin@lealglass.com.br")
print("   Senha: lealglass2025 (TROCAR após primeiro login)")
