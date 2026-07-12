/**
 * Converte todas as imagens de public/ para WebP com compressão severa.
 * - JPEG/PNG → WebP
 * - Reduz para largura máxima 1920px (suficiente para retina full HD)
 * - Qualidade 78 (ótimo equilíbrio visual/tamanho para fotos de arquitetura)
 * - Remove originais após conversão
 */
import sharp from 'sharp';
import { readdir, stat, rm, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { existsSync } from 'fs';

const PUBLIC_DIR = '/home/z/my-project/public';
const MAX_WIDTH = 1920; // retina full HD
const QUALITY = 78;
const THUMBNAIL_WIDTH = 600; // para cards menores

const CONVERTED = [];
const FAILED = [];

async function findImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const images = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Pula pasta download (não é pública)
      if (entry.name === 'download' || entry.name.startsWith('.')) continue;
      images.push(...(await findImages(fullPath)));
    } else {
      const ext = extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        // Pula favicon e logos pequenos (mantém como PNG para melhor qualidade em ícones)
        if (entry.name === 'favicon.png' || entry.name.startsWith('logo-') || entry.name === 'logo.svg' || entry.name === 'logo.jpg') {
          continue;
        }
        images.push(fullPath);
      }
    }
  }
  return images;
}

async function convertImage(srcPath) {
  const ext = extname(srcPath);
  const dstPath = srcPath.replace(new RegExp(`${ext}$`, 'i'), '.webp');
  
  try {
    const meta = await sharp(srcPath).metadata();
    const srcSize = (await stat(srcPath)).size;
    
    // Se a imagem for maior que MAX_WIDTH, redimensiona
    const resizeOpts = meta.width > MAX_WIDTH
      ? { width: MAX_WIDTH, withoutEnlargement: true }
      : undefined;
    
    let pipeline = sharp(srcPath, { failOn: 'none' });
    if (resizeOpts) pipeline = pipeline.resize(resizeOpts);
    
    await pipeline
      .webp({
        quality: QUALITY,
        effort: 6, // máxima eficiência de compressão
        smartSubsample: true,
      })
      .toFile(dstPath);
    
    const dstSize = (await stat(dstPath)).size;
    const reduction = Math.round((1 - dstSize / srcSize) * 100);
    
    CONVERTED.push({
      original: basename(srcPath),
      srcSize,
      dstSize,
      reduction,
      width: meta.width,
      height: meta.height,
    });
    
    // Remove o arquivo original apenas se a conversão foi bem-sucedida
    await rm(srcPath);
    
    return true;
  } catch (err) {
    FAILED.push({ file: basename(srcPath), error: err.message });
    return false;
  }
}

async function main() {
  console.log('🔍 Procurando imagens para converter...');
  const images = await findImages(PUBLIC_DIR);
  console.log(`📁 Encontradas: ${images.length} imagens\n`);
  
  for (const img of images) {
    console.log(`  → ${basename(img)}`);
    await convertImage(img);
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 RELATÓRIO DE CONVERSÃO');
  console.log('═══════════════════════════════════════════════');
  
  let totalSrc = 0, totalDst = 0;
  for (const c of CONVERTED) {
    console.log(`  ${c.original.padEnd(50)} ${formatBytes(c.srcSize).padStart(10)} → ${formatBytes(c.dstSize).padStart(10)}  (-${c.reduction}%)`);
    totalSrc += c.srcSize;
    totalDst += c.dstSize;
  }
  
  console.log('');
  console.log(`  ${'TOTAL'.padEnd(50)} ${formatBytes(totalSrc).padStart(10)} → ${formatBytes(totalDst).padStart(10)}  (-${Math.round((1 - totalDst/totalSrc) * 100)}%)`);
  
  if (FAILED.length > 0) {
    console.log('\n❌ Falhas:');
    for (const f of FAILED) {
      console.log(`  ${f.file}: ${f.error}`);
    }
  }
  
  console.log('\n✅ Conversão concluída!');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

main().catch(console.error);
