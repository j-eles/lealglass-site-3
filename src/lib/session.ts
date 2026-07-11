/**
 * Sessão (cookie assinado) — Web Crypto API.
 *
 * Arquivo separado de db.ts porque o Next.js middleware roda no
 * Edge Runtime, que não suporta `crypto` do Node. Web Crypto API
 * funciona em Edge, Node.js e browser.
 */

export type SessionData = {
  email: string;
  name: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
};

function getSecret(): string {
  return (
    process.env.ADMIN_SECRET || 'lealglass-session-secret-fallback'
  );
}

/**
 * Cria HMAC-SHA256 assinatura base64url (Web Crypto).
 */
async function hmacSign(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bufferToBase64Url(new Uint8Array(sig));
}

/**
 * Verifica HMAC-SHA256 com comparação constante-time.
 */
async function hmacVerify(message: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(message);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

function bufferToBase64Url(buf: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buf.length; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToString(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Cria token de sessão assinado.
 * Formato: base64url(payload).base64url(signature)
 */
export async function createSessionToken(
  data: Omit<SessionData, 'issuedAt' | 'expiresAt'>
): Promise<string> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 7 * 24 * 60 * 60 * 1000; // 7 dias
  const payload: SessionData = { ...data, issuedAt, expiresAt };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = bufferToBase64Url(
    new TextEncoder().encode(payloadStr)
  );
  const signature = await hmacSign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifica e decodifica token de sessão.
 * Retorna null se inválido ou expirado.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionData | null> {
  if (!token || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  if (!(await hmacVerify(payloadB64, signature))) return null;

  try {
    const payloadStr = base64UrlToString(payloadB64);
    const payload = JSON.parse(payloadStr) as SessionData;
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}
