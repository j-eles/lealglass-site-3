#!/usr/bin/env python3
"""
Baixa todos os arquivos do projeto lealglass-site-3 do OneDrive via SharePoint REST API.
Versão 2 - com cookies corretamente formatados via curl --cookie-jar.
"""
import subprocess
import json
import os
from pathlib import Path

SHAREPOINT_BASE = "https://onedrive.live.com"
SITE_PATH = "/personal/e3ae4b1630871780"
FOLDER_PATH = "/personal/e3ae4b1630871780/Documents/Documents/GitHub/lealglass-site-3"
DEST_DIR = Path("/home/z/my-project/lealglass-site-3")

# Pega cookies via agent-browser e salva em arquivo jar
result = subprocess.run(
    ["agent-browser", "cookies"],
    capture_output=True, text=True
)

# Converte formato "name=value" para Netscape cookie jar
jar_path = "/tmp/cookies_jar.txt"
with open(jar_path, "w") as f:
    f.write("# Netscape HTTP Cookie File\n")
    for line in result.stdout.strip().split("\n"):
        if "=" in line:
            name, value = line.split("=", 1)
            name = name.strip()
            value = value.strip()
            # Formato Netscape: domain | flag | path | secure | expiration | name | value
            f.write(f"onedrive.live.com\tTRUE\t/\tFALSE\t9999999999\t{name}\t{value}\n")

print(f"Cookies salvos em {jar_path}")

# Cria diretório destino
DEST_DIR.mkdir(parents=True, exist_ok=True)


def curl_get(url):
    """Faz GET com cookies."""
    result = subprocess.run(
        ["curl", "-sL",
         "-b", jar_path,
         "-A", "Mozilla/5.0",
         "-H", "Accept: application/json;odata=verbose",
         url],
        capture_output=True, text=True
    )
    return result.stdout


def curl_download(url, dest):
    """Baixa arquivo para dest."""
    result = subprocess.run(
        ["curl", "-sL",
         "-b", jar_path,
         "-A", "Mozilla/5.0",
         "-o", str(dest),
         url],
        capture_output=True, text=True
    )
    return result.returncode == 0


def list_folder(folder_path):
    """Lista conteúdo de uma pasta."""
    api_url = (
        f"{SHAREPOINT_BASE}{SITE_PATH}/_api/web/"
        f"GetFolderByServerRelativeUrl('{folder_path}')"
    )
    files_data = json.loads(curl_get(f"{api_url}/Files"))
    folders_data = json.loads(curl_get(f"{api_url}/Folders"))
    files = files_data.get("d", {}).get("results", [])
    folders = folders_data.get("d", {}).get("results", [])
    return files, folders


def download_file(file_url, dest_path):
    """Baixa um arquivo."""
    api_url = (
        f"{SHAREPOINT_BASE}{SITE_PATH}/_api/web/"
        f"GetFileByServerRelativeUrl('{file_url}')/$value"
    )
    return curl_download(api_url, dest_path)


def process_folder(folder_path, dest_dir, depth=0):
    indent = "  " * depth
    print(f"{indent}📁 {folder_path.split('/')[-1] or folder_path}")

    files, folders = list_folder(folder_path)
    dest_dir.mkdir(parents=True, exist_ok=True)

    for f in files:
        name = f.get("Name", "")
        file_url = f.get("ServerRelativeUrl", "")
        if not name or not file_url:
            continue
        dest_path = dest_dir / name
        print(f"{indent}  📄 {name}")
        ok = download_file(file_url, dest_path)
        if ok and dest_path.exists():
            size = dest_path.stat().st_size
            print(f"{indent}     ✅ {size:,} bytes")
        else:
            print(f"{indent}     ❌ Falhou")

    for sub in folders:
        sub_name = sub.get("Name", "")
        sub_url = sub.get("ServerRelativeUrl", "")
        if not sub_name or not sub_url:
            continue
        # Skip system/irrelevant folders
        if sub_name in ("Forms", "_rels", "node_modules", ".next", ".git"):
            continue
        process_folder(sub_url, dest_dir / sub_name, depth + 1)


# === Execução ===
print()
print("🚀 Iniciando download do projeto lealglass-site-3")
print(f"   Destino: {DEST_DIR}")
print()
process_folder(FOLDER_PATH, DEST_DIR)
print()
print("✅ Download concluído!")
