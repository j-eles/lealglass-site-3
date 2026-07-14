#!/usr/bin/env python3
"""
Substitui a imagem do hero pelo vídeo hero-video.mp4 no page.tsx.
Lida com quebras de linha CRLF (Windows).
"""
from pathlib import Path

page_path = Path("/home/z/my-project/src/app/page.tsx")
content = page_path.read_text(encoding="utf-8")

# Bloco antigo (imagem) - usando \r\n para matching exato
old_block = '''          {/* Background image — decorative, static for performance and reliability */}\r
          <div className="absolute inset-0 z-0" aria-hidden="true">\r
            <img\r
              src="/obras-curated/hero-casa-vidro.jpeg"\r
              alt=""\r
              role="presentation"\r
              fetchPriority="high"\r
              decoding="async"\r
              className="w-full h-full object-cover object-center"\r
            />\r
            <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/45 to-background" />\r
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />\r
          </div>'''

# Novo bloco (vídeo)
new_block = '''          {/* Background video — autoplay muted loop, with image poster fallback */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/obras-curated/hero-casa-vidro.jpeg"
              className="w-full h-full object-cover object-center"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
              {/* Fallback for browsers without video support */}
              <img
                src="/obras-curated/hero-casa-vidro.jpeg"
                alt=""
                className="w-full h-full object-cover object-center"
              />
            </video>
            {/* Overlays to keep text readable over video */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/45 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
          </div>'''

if old_block in content:
    content = content.replace(old_block, new_block)
    page_path.write_text(content, encoding="utf-8")
    print("✅ Bloco substituído com sucesso (CRLF)!")
else:
    # Tenta com \n apenas
    old_block_lf = old_block.replace('\r\n', '\n')
    new_block_lf = new_block  # Já está em \n
    if old_block_lf in content:
        content = content.replace(old_block_lf, new_block_lf)
        page_path.write_text(content, encoding="utf-8")
        print("✅ Bloco substituído com sucesso (LF)!")
    else:
        print("❌ Bloco antigo não encontrado!")
        # Vamos ver os primeiros caracteres do que tem lá
        import re
        m = re.search(r'Background image', content)
        if m:
            start = m.start()
            print("Contexto encontrado:")
            print(repr(content[start:start+500]))
