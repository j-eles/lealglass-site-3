/* ═══════════════════════════════════════════════════════════════════════
   Leal Glass — Service Worker
   Responsável por:
     1. Receber push notifications em background (PWA fechada)
     2. Mostrar notificação nativa do sistema
     3. Tratar clique na notificação (abrir app na rota certa)
     4. Fazer cache básico de assets do app shell
   ═══════════════════════════════════════════════════════════════════════ */

const SW_VERSION = '1.0.0';
const CACHE_NAME = `lealglass-v${SW_VERSION}`;
const APP_SHELL = [
  '/',
  '/admin/pedidos',
  '/manifest.json',
  '/favicon.png',
  '/logo-retina.png',
];

// ─── Install: pré-cacheia app shell ───────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// ─── Activate: limpa caches antigos ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Push: recebe mensagem do FCM e mostra notificação ────────
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    try {
      payload = { notification: { body: event.data?.text() || '' } };
    } catch {
      payload = {};
    }
  }

  // FCM envia: { notification: { title, body }, data: { ... } }
  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || 'Novo pedido · Leal Glass';
  const body = notification.body || 'Você recebeu uma nova solicitação de orçamento';
  const url = data.url || '/admin/pedidos';
  const tag = data.tag || notification.tag || 'lead-new';

  const options = {
    body,
    icon: '/logo-retina.png',
    badge: '/favicon.png',
    tag,
    renotify: true,
    requireInteraction: true,
    data: {
      url,
      ...data,
    },
    actions: [
      { action: 'open', title: 'Ver pedido' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
    vibrate: [200, 100, 200, 100, 200],
  };

  event.waitUntil(
    (async () => {
      // Tenta mostrar via self.registration (padrão web push)
      await self.registration.showNotification(title, options);

      // Avisa clientes ativos (PWA aberta) para atualizar a lista
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const client of clients) {
        client.postMessage({
          type: 'push-received',
          data: { title, body, url, ...data },
        });
      }
    })()
  );
});

// ─── Notification click: abre a URL certa no app ──────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/admin/pedidos';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Se já tem uma janela aberta, foca nela
      for (const client of allClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }

      // Senão, abre nova
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

// ─── Message: recebe mensagens da página (ex: skipWaiting) ────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── Fetch: network-first para rotas, cache-first para assets ─
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Não intercepta requests para API
  if (url.pathname.startsWith('/api/')) return;

  // Assets estáticos: cache-first
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|mp4|webm|css|js|woff2?)$/i)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // Navegação: network-first com fallback para cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    );
  }
});
