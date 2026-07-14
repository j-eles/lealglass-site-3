'use client';

/**
 * Página /admin/login
 *
 * Login simples email + senha para os 4 admins da Leal Glass.
 * Em caso de sucesso, redireciona para /admin/pedidos (ou ?next=...).
 */

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin/pedidos';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login');
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100svh] flex items-center justify-center px-6 py-12 bg-[#07080C]">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo-retina.png"
            alt="Leal Glass"
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="font-display text-2xl text-white mb-1">
            Central de Pedidos
          </h1>
          <p className="text-[0.82rem] text-white/50">
            Faça login para acessar os pedidos de orçamento
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-5"
        >
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80 text-[0.82rem]">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@lealglass.com.br"
                required
                autoFocus
                autoComplete="email"
                disabled={loading}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold/40"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80 text-[0.82rem]">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-gold/40"
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-start gap-2 text-[0.82rem] text-red-300 bg-red-500/10 border border-red-500/20 rounded-md p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-gold text-black hover:bg-gold-light font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[0.72rem] text-white/40 mt-6">
          Acesso restrito à equipe Leal Glass. Esqueceu sua senha? Contate o
          administrador do sistema.
        </p>
      </div>
    </main>
  );
}
