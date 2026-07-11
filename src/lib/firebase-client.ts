'use client';

/**
 * Firebase client-side SDK — roda no browser.
 *
 * Responsabilidades:
 *  1. Inicializar o Firebase app
 *  2. Solicitar permissão de notificação
 *  3. Obter token FCM do navegador
 *  4. Receber mensagens push em foreground (quando a PWA está aberta)
 *
 * O service worker (public/sw.js) cuida das mensagens em background
 * (PWA fechada ou minimizada).
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  isSupported,
  type Messaging,
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let app: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/**
 * Retorna a instância de Messaging, ou null se não suportado (Safari antigo, etc).
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  if (!(await isSupported())) return null;
  const firebaseApp = getFirebaseApp();
  messagingInstance = getMessaging(firebaseApp);
  return messagingInstance;
}

/**
 * Solicita permissão de notificação ao usuário.
 * Retorna true se concedida, false caso contrário.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Obtém o token FCM do navegador.
 * Requer: service worker registrado, permissão concedida, VAPID key configurada.
 *
 * @returns token string ou null se não conseguir obter
 */
export async function getFcmToken(): Promise<string | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.warn('[FCM] Mensageria web não suportada neste navegador');
    return null;
  }

  if (!VAPID_KEY || VAPID_KEY === 'PENDENTE') {
    console.warn('[FCM] VAPID key não configurada no .env');
    return null;
  }

  // Registra o service worker manualmente para garantir path correto
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
    } catch (err) {
      console.warn('[FCM] Falha ao registrar SW:', err);
    }
  }

  try {
    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });
    return token || null;
  } catch (err) {
    console.error('[FCM] Erro ao obter token:', err);
    return null;
  }
}

/**
 * Assina mensagens recebidas em foreground (PWA aberta).
 * Retorna função de unsubscribe.
 */
export async function onForegroundMessage(
  callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void
): Promise<() => void> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  const { onMessage } = await import('firebase/messaging');
  const unsubscribe = onMessage(messaging, (payload) => {
    callback(payload as Parameters<typeof callback>[0]);
  });
  return unsubscribe;
}
