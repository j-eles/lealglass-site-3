import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/db";

/**
 * POST /api/leads — Captura de leads (orçamento)
 *
 * Validação: nome + WhatsApp obrigatórios; telefone 10-11 dígitos.
 * Segurança: honeypot field + rate limiting in-memory por IP (5 req/min).
 * Persistência: SQLite via Prisma (model Lead).
 *
 * Integrações opcionais — descomente e configure no .env.local:
 *   LEADS_WEBHOOK_URL  → n8n / Make / Zapier
 *   RESEND_API_KEY     → e-mail via Resend
 *   GOOGLE_SHEETS_URL  → Google Sheets via Apps Script
 *   LEADS_SLACK_WEBHOOK→ Slack
 */

type LeadPayload = {
  name?: unknown;
  company?: unknown;
  phone?: unknown;
  email?: unknown;
  project?: unknown;
  message?: unknown;
  website?: unknown; // honeypot — deve permanecer vazio
};

// ── Rate limiting in-memory (5 requests por IP a cada 60s) ──
// Em produção com múltiplas instâncias, substituir por Upstash Redis.
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
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Muitas solicitações. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as LeadPayload;
    const { name, company, phone, email, project, message, website } = body;

    // ── Honeypot — se preenchido, é bot. Finge sucesso mas descarta. ──
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json(
        { ok: true, message: "Solicitação registrada com sucesso." },
        { status: 201 }
      );
    }

    // ── Validação ──
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.replace(/\D/g, "") : "";

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: "Informe seu nome completo." },
        { status: 400 }
      );
    }
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json(
        { error: "WhatsApp inválido. Verifique o número informado." },
        { status: 400 }
      );
    }

    const cleanEmail =
      typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : null;
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    const lead = {
      name: cleanName,
      company: typeof company === "string" ? company.trim() || null : null,
      phone: cleanPhone,
      email: cleanEmail,
      project: typeof project === "string" && project ? project : null,
      message: typeof message === "string" ? message.trim() || null : null,
      source: "website",
      createdAt: new Date().toISOString(),
    };

    // ── Persistência (Turso/SQLite via libsql) ──
    try {
      await createLead({
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        email: lead.email,
        project: lead.project,
        message: lead.message,
        source: lead.source,
      });
    } catch (dbErr) {
      console.error("[LEADS] DB error:", dbErr);
      // não bloqueia o usuário — segue para integrações
    }

    console.log("[LEAD]", JSON.stringify(lead));

    // ════════════════════════════════════════════
    // WEBHOOK — n8n / Make / Zapier
    // ════════════════════════════════════════════
    const webhookUrl = process.env.LEADS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        });
      } catch (e) {
        console.error("[LEADS] webhook error:", e);
      }
    }

    // ════════════════════════════════════════════
    // E-MAIL via Resend
    // ════════════════════════════════════════════
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "site@lealglass.com.br",
            to: "sistemas@lealglass.com.br",
            subject: `Novo lead: ${lead.name} — ${lead.company || "sem empresa"}`,
            text: [
              `Nome:     ${lead.name}`,
              `Empresa:  ${lead.company || "—"}`,
              `WhatsApp: ${lead.phone}`,
              `E-mail:   ${lead.email || "—"}`,
              `Projeto:  ${lead.project || "—"}`,
              `Mensagem: ${lead.message || "—"}`,
              `Data:     ${lead.createdAt}`,
            ].join("\n"),
          }),
        });
      } catch (e) {
        console.error("[LEADS] resend error:", e);
      }
    }

    // ════════════════════════════════════════════
    // GOOGLE SHEETS via Apps Script
    // ════════════════════════════════════════════
    if (process.env.GOOGLE_SHEETS_URL) {
      try {
        await fetch(process.env.GOOGLE_SHEETS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        });
      } catch (e) {
        console.error("[LEADS] sheets error:", e);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          "Solicitação registrada. Nosso engenheiro entra em contato em até 2 horas úteis.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[LEADS] unexpected:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}

/** GET — health check simples para monitoramento. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "leads", ts: Date.now() });
}
