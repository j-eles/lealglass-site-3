#!/usr/bin/env python3
"""Reescreve o .env com a FIREBASE_PRIVATE_KEY correta."""
from pathlib import Path

PRIVATE_KEY = """-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmYANHQHIzu5uN\\nKL6pCk9KJQ8XvhgPH063Uvl8I/LotY7CCRpUwaVEGdkOCTUDZf1fP+G/QJaMEPfh\\nOtK7my/jCV77UPpQ/fp6n9PuVsisALBwYjhW5R7sE8U9ELWHEamQa/poZ+NUHCcC\\nLQuLwmWgvHkHDCj+ikisSbFhItN4CosVQXQn6YcMqjD0VWs/X3va4Fk8R14MxcIC\\nNFTLjQUFeqaX2erlzb+mrvYhdcMuhfr4ae0y68rKHNmpErl2tcTqPp7gSh58s94m\\nOLtUCCQzLZW8kGoHrax2EXZW8tcHC6fIHR2ietaxP52XxVAPYsnNo1OxEnkY9gCI\\nNMn8nuXxAgMBAAECggEAEbQGtUa0wC92ykrrGraXoEaYOAkIq1dD+3rPRDfZCY0E\\nHz5zuFAQo1HyyC0PoIhyMPftr/mR616E2cj2EnNdYZWmLyy7LfIQfIrUNLi0SqUa\\nISM6Znij1S/3XVuRTUmCVvU+ZGylglYqim87msf5I2TapfbTx930BK0kvDbF9LBS\\nimJLkNpEJmjq4eUUOuTT2ElHO2kn8ZWT8kLqewwo+7fr5Vt9blHGuF9KlJU9E4l6\\nRVv5OIcXFPd1tjPn+TxFAFOebj2Mfi/vVRKQxeizzMoA8TvaGEXTEEePgD83pCak\\n12AjMFvs1c+zWn9qgBX3LBNa4pyLTF3cx+vHElKFRwKBgQDYr/Okvo37VMRMAMqC\\nZd7dlKez9k+zJci72Fk35ovUq83EOtgEAGUSV8LSRH18173906W/Ud+uFS2kWZPt\\nVwS72hpMus5sOzFWqUNky2kFNM5TNDvNGJ45E8ITNxFj36WvX9WpSEeFCiQduEWY\\nddJqv/e78gw+muKJwZyuwz8VvwKBgQDEj06CcVko1RlCg8LHOVCAIYGgDbHLb++M\\n3CBufBl4v2dCPZsaK1D16oAtMTVflevOkGkdufnc8E/cNVppLx6NXSM1yvTCN1yy\\nzl4PY81LisKI4RqUhccjIZp8hE/zxgzbKrK9AJrDAXyz3bVjS1qLXIE/rd1kN5YO\\nSZyHvITQTwKBgC3jfU6bSEg8mGGcHUbmOf9k9usGs7Q1wT/+vk43Vc+RHr960rpu\\nNvleepS7CnRA4Cx8APL2bM9aDtNqYQh3UDpUIxOyz/pdwsIekHYtGa2PlE5MlomF\\nuCRQSd514AntmBH+0qnJ89N55VIh7yMteIVA6D72MJ+lf2o7BWqBUL/TAoGAah/V\\ni6gXM2yazsbFCztusz9j9T5vmB8/fxX6jKyENCVjYuhQLbjlZWDPA5dl8c3IGybt\\nGhenSBqXg5Vq0w+Vt01qDUkfDR1G92NkdXq1BOxOTAj9iOMRuW4TMtddM4jiuBI9\\nnr4M0Oykn5g8rveoU0YGopMEzW8VnXExCjhGnRECgYEAxonp7L1nSd0jp9K4PA/B\\nlIZP2L3WzudgpiTcd5qb7bx/W6x8YkJS/V8LiqvN1eLDHlAoB7pvxczQ1RRPDqdV\\nk1gK621WbyMYZTMfuMOFTXqOcZ3ee3mpC64n5TgpowVlA1lfyRYps+N8sikuMD/a\\ndb7G6s7OwRS1UFZlp9A83aU=\\n-----END PRIVATE KEY-----\\n"""

env_path = Path("/home/z/my-project/.env")
content = env_path.read_text()

# Substitui a linha inteira da FIREBASE_PRIVATE_KEY
lines = content.split("\n")
new_lines = []
for line in lines:
    if line.startswith("FIREBASE_PRIVATE_KEY="):
        new_lines.append(f"FIREBASE_PRIVATE_KEY={PRIVATE_KEY}")
    else:
        new_lines.append(line)

env_path.write_text("\n".join(new_lines))
print("OK - .env atualizado com private key correta")
print(f"Tamanho da private key: {len(PRIVATE_KEY)} chars")
