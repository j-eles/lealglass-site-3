'use client';

/**
 * Hook React para gerenciar FCM no cliente.
 *
 * Funcionalidades:
 *  - Verifica suporte do navegador
 *  - Solicita permissão (apenas quando chamado via requestPermission)
 *  - Obtém token e envia para a API registrar
 *  - Escuta mensagens em foreground e mostra toast
 *  - Expõe estado: status, token, error
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  getFcmToken,
  requestNotificationPermission,
  onForegroundMessage,
} from '@/lib/firebase-client';

type FcmStatus =
  | 'unsupported'
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'error';

type UseFcmReturn = {
  status: FcmStatus;
  token: string | null;
  error: string | null;
  requestPermission: () => Promise<void>;
  registerToken: (userEmail: string) => Promise<void>;
};

export function useFcm(): UseFcmReturn {
  const [status, setStatus] = useState<FcmStatus>('idle');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Verifica suporte inicial
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'granted') {
      setStatus('granted');
    } else if (Notification.permission === 'denied') {
      setStatus('denied');
    }
  }, []);

  // Escuta mensagens em foreground quando temos permissão
  useEffect(() => {
    if (status !== 'granted') return;

    let active = true;
    (async () => {
      const unsubscribe = await onForegroundMessage((payload) => {
        const title = payload.notification?.title || 'Nova notificação';
        const body = payload.notification?.body || '';
        toast(title, {
          description: body,
          duration: 8000,
          action: payload.data?.url
            ? {
                label: 'Ver',
                onClick: () => window.open(payload.data!.url!, '_self'),
              }
            : undefined,
        });
        // Toca um som curto
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {}); // ignora se bloqueado
        } catch {}
      });
      if (active) {
        unsubscribeRef.current = unsubscribe;
      } else {
        unsubscribe();
      }
    })();

    return () => {
      active = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [status]);

  const requestPermission = useCallback(async () => {
    setStatus('requesting');
    setError(null);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setStatus('denied');
        setError(
          'Permissão negada. Habilite notificações nas configurações do navegador.'
        );
        return;
      }
      setStatus('granted');
      const t = await getFcmToken();
      setToken(t);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Erro ao solicitar permissão');
    }
  }, []);

  const registerToken = useCallback(
    async (userEmail: string) => {
      let t = token;
      if (!t) {
        t = await getFcmToken();
        if (!t) {
          setError('Não foi possível obter token FCM');
          return;
        }
        setToken(t);
      }

      try {
        const res = await fetch('/api/device-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: t,
            userAgent: navigator.userAgent,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        toast.success('Notificações ativadas neste dispositivo');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao registrar token');
        throw err;
      }
    },
    [token]
  );

  return {
    status,
    token,
    error,
    requestPermission,
    registerToken,
  };
}
