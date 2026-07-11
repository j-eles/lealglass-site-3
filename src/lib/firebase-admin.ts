/**
 * Firebase Admin SDK — server-side only.
 *
 * Usado para:
 *  - Enviar push notifications via FCM quando um novo lead chega
 *  - Validar ID tokens (futuro, se migrarmos para Firebase Auth)
 *
 * Inicialização lazy — só carrega quando necessário.
 *
 * Nota: firebase-admin v14+ usa API modular. Importamos messaging
 * via subpath 'firebase-admin/messaging' e cert via top-level.
 */

import admin from 'firebase-admin';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import type { App } from 'firebase-admin/app';

let app: App | null = null;
let messagingInstance: Messaging | null = null;

function getAdminApp(): App {
  if (app) return app;

  const serviceAccountProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // A private key é armazenada em base64 no .env para evitar
  // problemas com redaction de chaves privadas em arquivos de texto.
  const privateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64;

  if (!serviceAccountProjectId) {
    throw new Error(
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID não configurado. Não é possível inicializar Firebase Admin.'
    );
  }

  // Sem service account completo — tenta inicialização com projectId apenas
  // (só funciona em ambientes Google com Application Default Credentials)
  if (!clientEmail || !privateKeyB64) {
    app = admin.initializeApp({
      projectId: serviceAccountProjectId,
    });
    return app;
  }

  // Decodifica a private key do base64
  const privateKey = Buffer.from(privateKeyB64, 'base64').toString('utf-8');

  // firebase-admin v14+: cert está no top-level, não em admin.credential.cert
  app = admin.initializeApp({
    credential: admin.cert({
      projectId: serviceAccountProjectId,
      clientEmail,
      privateKey,
    }),
  });
  return app;
}

function getMessagingInstance(): Messaging {
  if (messagingInstance) return messagingInstance;
  const adminApp = getAdminApp();
  messagingInstance = getMessaging(adminApp);
  return messagingInstance;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  data?: Record<string, string>;
  tag?: string; // agrupa notificações com mesmo tag (a última substitui as anteriores)
};

/**
 * Envia push notification para uma lista de device tokens FCM.
 *
 * Usa FCM HTTP v1 API (via Admin SDK) — método recomendado desde junho/2024,
 * quando o Firebase descontinuou o "legacy server key" para web push.
 *
 * @returns número de notificações entregues com sucesso
 */
export async function sendPushToTokens(
  tokens: string[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; errors: string[] }> {
  if (tokens.length === 0) {
    return { sent: 0, failed: 0, errors: [] };
  }

  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  try {
    const messaging = getMessagingInstance();

    // FCM HTTP v1: usa sendEachForMulticast para enviar para múltiplos tokens
    const message = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: payload.url || '/',
        ...payload.data,
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/logo-retina.png',
          badge: '/favicon.png',
          tag: payload.tag || 'lead-new',
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Ver pedido',
            },
            {
              action: 'dismiss',
              title: 'Dispensar',
            },
          ],
        },
        fcmOptions: {
          link: payload.url || '/admin/pedidos',
        },
      },
      android: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/logo-retina.png',
          color: '#C9A24B',
          tag: payload.tag || 'lead-new',
          priority: 'high' as const,
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);

    response.responses.forEach((resp, idx) => {
      if (resp.success) {
        sent++;
      } else {
        failed++;
        const tokenPreview = tokens[idx].slice(0, 12) + '...';
        errors.push(`${tokenPreview}: ${resp.error?.message || 'unknown'}`);
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`FCM init error: ${msg}`);
    failed = tokens.length;
  }

  return { sent, failed, errors };
}

/**
 * Helper específico para notificação de novo lead.
 */
export async function notifyNewLead(lead: {
  id: string;
  name: string;
  company?: string | null;
  phone: string;
  project?: string | null;
}): Promise<void> {
  // Importação dinâmica para evitar circularidade
  const { listActiveDeviceTokens } = await import('@/lib/db');

  const tokens = await listActiveDeviceTokens();
  if (tokens.length === 0) {
    console.log('[FCM] Nenhum device token ativo — push skipped');
    return;
  }

  const title = `Novo pedido · ${lead.name}`;
  const body = lead.project
    ? `${lead.project}${lead.company ? ` · ${lead.company}` : ''}`
    : lead.company || 'Solicitação de orçamento';

  const result = await sendPushToTokens(tokens, {
    title,
    body,
    url: `/admin/pedidos?id=${lead.id}`,
    tag: 'lead-new',
    data: {
      leadId: lead.id,
      type: 'new-lead',
    },
  });

  console.log(
    `[FCM] Push enviado: ${result.sent}/${tokens.length} entregues`,
    result.errors.length ? { errors: result.errors } : ''
  );
}
