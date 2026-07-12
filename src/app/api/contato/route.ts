import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';

/**
 * POST /api/contato
 *
 * Formulário genérico de contato com upload de arquivos.
 * -Aceita FormData: name, company, email, phone, subject, message, consent, files[]
 * -Salva arquivos em /uploads/contato/{ticket}/{filename}
 * -Salva registro no Turso (tabela ContatoMessage)
 * -Envia email via Resend se RESEND_API_KEY configurado
 *
 * Aceita: PDF, DWG, DXF, JPG, PNG, WebP
 * Máximo: 10 MB por arquivo, 5 arquivos
 */
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;
const ACCEPTED_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.webp'];

// Rate limiting simples em memória (5 requests por IP a cada 60s)
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function generateTicketId(): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(4).toString('hex');
  return `CT${ts}${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Muitas solicitações. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const name = (formData.get('name') as string | null)?.trim() || '';
    const company = (formData.get('company') as string | null)?.trim() || '';
    const email = (formData.get('email') as string | null)?.trim() || '';
    const phone = (formData.get('phone') as string | null)?.trim() || '';
    const subject = (formData.get('subject') as string | null) || '';
    const message = (formData.get('message') as string | null)?.trim() || '';
    const consent = formData.get('consent') === 'true';

    // Validações
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Nome inválido.' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'Assunto obrigatório.' }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: 'Mensagem deve ter pelo menos 10 caracteres.' },
        { status: 400 }
      );
    }
    if (!consent) {
      return NextResponse.json(
        { error: 'É necessário aceitar a política de privacidade.' },
        { status: 400 }
      );
    }

    // Coleta arquivos
    const files: File[] = [];
    const allEntries = Array.from(formData.entries());
    for (const [key, value] of allEntries) {
      if (key === 'files' && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_FILES} arquivos.` },
        { status: 400 }
      );
    }

    // Valida cada arquivo
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name}: arquivo maior que 10 MB.` },
          { status: 400 }
        );
      }
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `${file.name}: tipo não suportado.` },
          { status: 400 }
        );
      }
    }

    const ticketId = generateTicketId();
    const savedFiles: { name: string; size: number; path: string }[] = [];

    // Salva arquivos em disco se houver
    if (files.length > 0) {
      const uploadDir = join(process.cwd(), 'uploads', 'contato', ticketId);
      await mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitiza nome do arquivo
        const safeName = file.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = join(uploadDir, safeName);
        await writeFile(filePath, buffer);
        savedFiles.push({ name: safeName, size: file.size, path: `/uploads/contato/${ticketId}/${safeName}` });
      }
    }

    // Salva no Turso (tabela ContatoMessage — criada via setup-turso.ts)
    try {
      const { db } = await import('@/lib/db');
      const id = `cm${Date.now().toString(36)}${randomBytes(4).toString('hex')}`;
      await db.execute({
        sql: `INSERT INTO "ContatoMessage" (id, ticketId, name, company, email, phone, subject, message, files, ip, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          id,
          ticketId,
          name,
          company || null,
          email,
          phone || null,
          subject,
          message,
          savedFiles.length > 0 ? JSON.stringify(savedFiles) : null,
          ip,
        ],
      });
    } catch (dbErr) {
      console.error('[CONTATO] DB error (não bloqueante):', dbErr);
    }

    // Dispara email via Resend se configurado
    if (process.env.RESEND_API_KEY) {
      try {
        const subjectLabels: Record<string, string> = {
          orcamento: 'Orçamento',
          documentos: 'Envio de documentos',
          suporte: 'Suporte técnico',
          parceria: 'Parceria',
          carreira: 'Trabalhe conosco',
          outro: 'Outro assunto',
        };

        const emailBody = [
          `Ticket: ${ticketId}`,
          `Assunto: ${subjectLabels[subject] || subject}`,
          '',
          `Nome: ${name}`,
          `Empresa: ${company || '—'}`,
          `Email: ${email}`,
          `Telefone: ${phone || '—'}`,
          `IP: ${ip}`,
          '',
          'Mensagem:',
          message,
          '',
          savedFiles.length > 0
            ? `Arquivos anexados (${savedFiles.length}):\n${savedFiles
                .map((f) => `  - ${f.name} (${(f.size / 1024).toFixed(0)} KB)`)
                .join('\n')}`
            : 'Sem anexos.',
        ].join('\n');

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'site@lealglass.com.br',
            to: 'contato@lealglass.com.br',
            reply_to: email,
            subject: `[${ticketId}] ${subjectLabels[subject] || 'Contato'} — ${name}`,
            text: emailBody,
          }),
        });
      } catch (emailErr) {
        console.error('[CONTATO] Email error (não bloqueante):', emailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      ticketId,
      message: 'Mensagem recebida. Responderemos em até 1 dia útil.',
    });
  } catch (err) {
    console.error('[CONTATO] unexpected:', err);
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente ou use o WhatsApp.' },
      { status: 500 }
    );
  }
}

/** GET /api/contato — health check */
export async function GET() {
  return NextResponse.json({ ok: true, service: 'contato', ts: Date.now() });
}
