import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

/**
 * POST /api/contato
 *
 * Formulário genérico de contato com upload de arquivos.
 * - Aceita FormData: name, company, email, phone, subject, message, consent, files[]
 * - Salva registro no Turso (tabela ContatoMessage)
 * - Envia email via Resend com anexos (se RESEND_API_KEY configurado)
 *
 * ⚠️ COMPATÍVEL COM VERCEL: não escreve arquivos no disco (filesystem read-only).
 * Anexa os arquivos diretamente no email via Resend (base64).
 *
 * ⚠️ LIMITE DA VERCEL: Serverless Functions têm limite de 4.5 MB para o body.
 * Por isso, limitamos a 4 MB total de anexos (margem de segurança).
 *
 * Aceita: PDF, DWG, DXF, JPG, PNG, WebP
 * Máximo: 4 MB por arquivo, 3 arquivos, 4 MB total
 */
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB por arquivo (limite Vercel)
const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4 MB total (limite Vercel = 4.5 MB)
const MAX_FILES = 3;
const ACCEPTED_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.webp'];

// Rate limiting simples em memória
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

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
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

    // Valida cada arquivo e calcula tamanho total
    let totalSize = 0;
    const fileInfos: { name: string; size: number }[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name}: arquivo maior que 4 MB.` },
          { status: 400 }
        );
      }
      totalSize += file.size;
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `${file.name}: tipo não suportado. Aceitos: ${ACCEPTED_EXTENSIONS.join(', ')}` },
          { status: 400 }
        );
      }
      fileInfos.push({
        name: sanitizeFilename(file.name),
        size: file.size,
      });
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: `Tamanho total dos arquivos excede 4 MB.` },
        { status: 400 }
      );
    }

    const ticketId = generateTicketId();

    // Prepara anexos para o Resend (base64, formato correto)
    // Resend aceita apenas: filename + content (base64 string)
    const attachments: { filename: string; content: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const info = fileInfos[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: info.name,
        content: buffer.toString('base64'),
      });
    }

    // Salva no Turso
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
          fileInfos.length > 0 ? JSON.stringify(fileInfos) : null,
          ip,
        ],
      });
    } catch (dbErr) {
      console.error('[CONTATO] DB error (não bloqueante):', dbErr);
    }

    // Dispara email via Resend se configurado (com anexos)
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
          fileInfos.length > 0
            ? `Arquivos anexados (${fileInfos.length}):\n${fileInfos
                .map((f) => `  - ${f.name} (${(f.size / 1024).toFixed(0)} KB)`)
                .join('\n')}`
            : 'Sem anexos.',
        ].join('\n');

        const emailPayload: Record<string, unknown> = {
          from: 'site@lealglass.com.br',
          to: 'contato@lealglass.com.br',
          reply_to: email,
          subject: `[${ticketId}] ${subjectLabels[subject] || 'Contato'} — ${name}`,
          text: emailBody,
        };

        // Só adiciona attachments se houver arquivos
        if (attachments.length > 0) {
          emailPayload.attachments = attachments;
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error('[CONTATO] Resend API error:', resendResponse.status, errorText);
        }
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
    if (err instanceof Error && err.message.includes('body')) {
      return NextResponse.json(
        { error: 'Arquivos muito grandes. Limite total: 4 MB.' },
        { status: 413 }
      );
    }
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
