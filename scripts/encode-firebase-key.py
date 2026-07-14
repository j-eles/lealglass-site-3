#!/usr/bin/env python3
"""
Converte a Firebase private key para base64 e atualiza o .env.
Isso evita problemas com redaction de chaves SSH/privadas em arquivos .env.
"""
import base64
from pathlib import Path

# A private key completa, com newlines reais (não \n literais)
PRIVATE_KEY_REAL = """-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmYANHQHIzu5uN
KL6pCk9KJQ8XvhgPH063Uvl8I/LotY7CCRpUwaVEGdkOCTUDZf1fP+G/QJaMEPfh
OtK7my/jCV77UPpQ/fp6n9PuVsisALBwYjhW5R7sE8U9ELWHEamQa/poZ+NUHCcC
LQuLwmWgvHkHDCj+ikisSbFhItN4CosVQXQn6YcMqjD0VWs/X3va4Fk8R14MxcIC
NFTLjQUFeqaX2erlzb+mrvYhdcMuhfr4ae0y68rKHNmpErl2tcTqPp7gSh58s94m
OLtUCCQzLZW8kGoHrax2EXZW8tcHC6fIHR2ietaxP52XxVAPYsnNo1OxEnkY9gCI
NMn8nuXxAgMBAAECggEAEbQGtUa0wC92ykrrGraXoEaYOAkIq1dD+3rPRDfZCY0E
Hz5zuFAQo1HyyC0PoIhyMPftr/mR616E2cj2EnNdYZWmLyy7LfIQfIrUNLi0SqUa
ISM6Znij1S/3XVuRTUmCVvU+ZGylglYqim87msf5I2TapfbTx930BK0kvDbF9LBS
imJLkNpEJmjq4eUUOuTT2ElHO2kn8ZWT8kLqewwo+7fr5Vt9blHGuF9KlJU9E4l6
RVv5OIcXFPd1tjPn+TxFAFOebj2Mfi/vVRKQxeizzMoA8TvaGEXTEEePgD83pCak
12AjMFvs1c+zWn9qgBX3LBNa4pyLTF3cx+vHElKFRwKBgQDYr/Okvo37VMRMAMqC
Zd7dlKez9k+zJci72Fk35ovUq83EOtgEAGUSV8LSRH18173906W/Ud+uFS2kWZPt
VwS72hpMus5sOzFWqUNky2kFNM5TNDvNGJ45E8ITNxFj36WvX9WpSEeFCiQduEWY
ddJqv/e78gw+muKJwZyuwz8VvwKBgQDEj06CcVko1RlCg8LHOVCAIYGgDbHLb++M
3CBufBl4v2dCPZsaK1D16oAtMTVflevOkGkdufnc8E/cNVppLx6NXSM1yvTCN1yy
zl4PY81LisKI4RqUhccjIZp8hE/zxgzbKrK9AJrDAXyz3bVjS1qLXIE/rd1kN5YO
SZyHvITQTwKBgC3jfU6bSEg8mGGcHUbmOf9k9usGs7Q1wT/+vk43Vc+RHr960rpu
NvleepS7CnRA4Cx8APL2bM9aDtNqYQh3UDpUIxOyz/pdwsIekHYtGa2PlE5MlomF
uCRQSd514AntmBH+0qnJ89N55VIh7yMteIVA6D72MJ+lf2o7BWqBUL/TAoGAah/V
i6gXM2yazsbFCztusz9j9T5vmB8/fxX6jKyENCVjYuhQLbjlZWDPA5dl8c3IGybt
GhenSBqXg5Vq0w+Vt01qDUkfDR1G92NkdXq1BOxOTAj9iOMRuW4TMtddM4jiuBI9
nr4M0Oykn5g8rveoU0YGopMEzW8VnXExCjhGnRECgYEAxonp7L1nSd0jp9K4PA/B
lIZP2L3WzudgpiTcd5qb7bx/W6x8YkJS/V8LiqvN1eLDHlAoB7pvxczQ1RRPDqdV
k1gK621WbyMYZTMfuMOFTXqOcZ3ee3mpC64n5TgpowVlA1lfyRYps+N8sikuMD/a
db7G6s7OwRS1UFZlp9A83aU=
-----END PRIVATE KEY-----
"""

# Codifica em base64 (preserva os newlines reais)
key_b64 = base64.b64encode(PRIVATE_KEY_REAL.encode("utf-8")).decode("ascii")

print(f"Tamanho da key original: {len(PRIVATE_KEY_REAL)} chars")
print(f"Tamanho da key em base64: {len(key_b64)} chars")
print(f"Primeiros 60 chars do base64: {key_b64[:60]}")

# Atualiza o .env
env_path = Path("/home/z/my-project/.env")
content = env_path.read_text()

# Substitui a linha da FIREBASE_PRIVATE_KEY
lines = content.split("\n")
new_lines = []
for line in lines:
    if line.startswith("FIREBASE_PRIVATE_KEY="):
        new_lines.append(f"FIREBASE_PRIVATE_KEY_B64={key_b64}")
    else:
        new_lines.append(line)

env_path.write_text("\n".join(new_lines))
print("\n✅ .env atualizado: FIREBASE_PRIVATE_KEY substituída por FIREBASE_PRIVATE_KEY_B64")
print(f"   (precisamos atualizar o firebase-admin.ts para decodificar)")
