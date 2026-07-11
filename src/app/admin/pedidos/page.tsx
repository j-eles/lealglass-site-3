'use client';

/**
 * Página /admin/pedidos
 *
 * Mostra lista de pedidos de orçamento recebidos pelo site.
 * Funcionalidades:
 *  - Filtro por status (todos / novos / lidos / contatados / concluídos)
 *  - Card para cada pedido com nome, empresa, telefone, projeto, mensagem
 *  - Ações: ligar, WhatsApp, email, marcar como lido, marcar como atendido
 *  - Botão para ativar notificações push neste dispositivo (PWA)
 *  - Botão para instalar a PWA
 *  - Logout
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Building2,
  User,
  FileText,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Bell,
  BellOff,
  LogOut,
  RefreshCw,
  Smartphone,
  ExternalLink,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFcm } from '@/hooks/use-fcm';
import { toast } from 'sonner';

type Lead = {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  project: string | null;
  message: string | null;
  source: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
};

type Counts = {
  new: number;
  read: number;
  contacted: number;
  done: number;
};

type User = {
  email: string;
  name: string;
  role: string;
};

type FilterStatus = 'all' | 'new' | 'read' | 'contacted' | 'done';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  read: { label: 'Lido', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  contacted: { label: 'Contatado', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  done: { label: 'Concluído', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

function formatPhone(phone: string): string {
  // phone vem como só dígitos (10 ou 11)
  const ddd = phone.slice(0, 2);
  const part1 = phone.length === 11 ? phone.slice(2, 7) : phone.slice(2, 6);
  const part2 = phone.length === 11 ? phone.slice(7) : phone.slice(6);
  return `(${ddd}) ${part1}-${part2}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  try {
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `${min}min atrás`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h atrás`;
    const days = Math.floor(h / 24);
    return `${days}d atrás`;
  } catch {
    return '';
  }
}

export default function AdminPedidosPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<Counts>({ new: 0, read: 0, contacted: 0, done: 0 });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  const fcm = useFcm();

  // Captura evento de instalação da PWA
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Escuta mensagens do SW (push recebido em background)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'push-received') {
          fetchLeads();
          toast('Novo pedido recebido!', {
            description: event.data.data?.title,
          });
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
      return () => navigator.serviceWorker.removeEventListener('message', handler);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const url = filter === 'all' ? '/api/admin/leads' : `/api/admin/leads?status=${filter}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      setLeads(data.leads || []);
      setCounts(data.counts || { new: 0, read: 0, contacted: 0, done: 0 });
      setUser(data.user || null);
    } catch (err) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLeads();
    // Polling leve a cada 60s quando a aba está visível
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLeads();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  // Atualiza status de um lead
  async function updateStatus(leadId: string, status: 'read' | 'contacted' | 'done' | 'new') {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Pedido marcado como ${STATUS_LABELS[status].label.toLowerCase()}`);
      fetchLeads();
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  async function handleEnableNotifications() {
    try {
      await fcm.requestPermission();
      if (fcm.status === 'granted' && user) {
        await fcm.registerToken(user.email);
      }
    } catch (err) {
      toast.error('Não foi possível ativar notificações');
    }
  }

  async function handleInstallPwa() {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      toast.success('App instalado! Procure o ícone na tela inicial.');
    }
    setInstallPromptEvent(null);
  }

  const total = counts.new + counts.read + counts.contacted + counts.done;
  const filteredLeads = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="min-h-[100svh] bg-[#07080C] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#07080C]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo-retina.png" alt="" className="w-9 h-9 object-contain flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg leading-tight truncate">
                Central de Pedidos
              </h1>
              <p className="text-[0.7rem] text-white/40 truncate">
                {user ? `Olá, ${user.name.split(' ')[0]}` : 'Carregando...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLeads}
              disabled={loading}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Banner de notificações / instalação */}
        {(fcm.status !== 'granted' || installPromptEvent) && fcm.status !== 'unsupported' && (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-white">
                  {fcm.status !== 'granted'
                    ? 'Ative as notificações push'
                    : 'Instale o app no seu celular'}
                </h2>
                <p className="text-[0.78rem] text-white/60 mt-0.5">
                  {fcm.status !== 'granted'
                    ? 'Receba um alerta no celular sempre que um novo pedido de orçamento chegar pelo site.'
                    : 'Adicione à tela inicial para acesso rápido e notificações em segundo plano.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {fcm.status !== 'granted' && (
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  disabled={fcm.status === 'requesting'}
                  className="bg-amber-500 text-black hover:bg-amber-400"
                >
                  {fcm.status === 'requesting' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ativando...</>
                  ) : (
                    <><Bell className="w-4 h-4 mr-2" /> Ativar notificações</>
                  )}
                </Button>
              )}
              {installPromptEvent && (
                <Button
                  size="sm"
                  onClick={handleInstallPwa}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Smartphone className="w-4 h-4 mr-2" /> Instalar app
                </Button>
              )}
            </div>
            {fcm.error && (
              <p className="text-[0.72rem] text-red-300">{fcm.error}</p>
            )}
          </div>
        )}

        {/* Stats / Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          <FilterCard
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="Todos"
            count={total}
            color="text-white"
          />
          <FilterCard
            active={filter === 'new'}
            onClick={() => setFilter('new')}
            label="Novos"
            count={counts.new}
            color="text-amber-300"
          />
          <FilterCard
            active={filter === 'read'}
            onClick={() => setFilter('read')}
            label="Lidos"
            count={counts.read}
            color="text-blue-300"
          />
          <FilterCard
            active={filter === 'contacted'}
            onClick={() => setFilter('contacted')}
            label="Contatados"
            count={counts.contacted}
            color="text-purple-300"
          />
          <FilterCard
            active={filter === 'done'}
            onClick={() => setFilter('done')}
            label="Concluídos"
            count={counts.done}
            color="text-emerald-300"
          />
        </div>

        {/* Lista de pedidos */}
        {loading && leads.length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/30 mb-3" />
            <p className="text-sm text-white/40">Carregando pedidos...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-xl">
            <CheckCircle2 className="w-10 h-10 mx-auto text-white/20 mb-3" />
            <p className="text-sm text-white/50">
              {filter === 'all'
                ? 'Nenhum pedido recebido ainda.'
                : `Nenhum pedido com status "${STATUS_LABELS[filter]?.label || filter}".`}
            </p>
            <p className="text-[0.72rem] text-white/30 mt-1">
              Novos pedidos do site aparecem aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                updating={updatingId === lead.id}
                onUpdateStatus={(s) => updateStatus(lead.id, s)}
                autoMarkRead={lead.status === 'new'}
                onAutoMarkRead={() => updateStatus(lead.id, 'read')}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterCard({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-lg border transition ${
        active
          ? 'bg-white/10 border-white/30'
          : 'bg-white/[0.02] border-white/5 hover:border-white/15'
      }`}
    >
      <p className={`text-[0.7rem] uppercase tracking-wide text-white/40 mb-1`}>
        {label}
      </p>
      <p className={`text-xl font-semibold ${color}`}>{count}</p>
    </button>
  );
}

function LeadCard({
  lead,
  updating,
  onUpdateStatus,
  autoMarkRead,
  onAutoMarkRead,
}: {
  lead: Lead;
  updating: boolean;
  onUpdateStatus: (s: 'new' | 'read' | 'contacted' | 'done') => void;
  autoMarkRead: boolean;
  onAutoMarkRead: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = STATUS_LABELS[lead.status] || STATUS_LABELS.new;

  // Auto-marca como lido após 2s se for novo
  useEffect(() => {
    if (autoMarkRead) {
      const t = setTimeout(() => onAutoMarkRead(), 2000);
      return () => clearTimeout(t);
    }
  }, [autoMarkRead, onAutoMarkRead]);

  const phoneFormatted = formatPhone(lead.phone);
  const whatsappUrl = `https://wa.me/55${lead.phone}?text=${encodeURIComponent(
    `Olá ${lead.name}, recebemos seu pedido de orçamento no site da Leal Glass. Como posso ajudar?`
  )}`;

  return (
    <article
      className={`bg-white/[0.03] border rounded-xl p-4 sm:p-5 transition ${
        lead.status === 'new'
          ? 'border-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]'
          : 'border-white/10'
      }`}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className={`text-[0.65rem] px-2 py-0.5 ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
            {lead.status === 'new' && (
              <span className="text-[0.65rem] text-amber-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                novo
              </span>
            )}
            <span className="text-[0.7rem] text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(lead.createdAt)}
            </span>
          </div>
          <h3 className="font-medium text-white text-base leading-tight truncate">
            {lead.name}
          </h3>
          {lead.company && (
            <p className="text-[0.78rem] text-white/50 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              {lead.company}
            </p>
          )}
        </div>
      </div>

      {/* Projeto */}
      {lead.project && (
        <div className="mb-3 text-[0.82rem] text-white/70 bg-white/[0.03] rounded-md p-2.5">
          <p className="text-[0.65rem] uppercase tracking-wide text-white/40 mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Projeto
          </p>
          <p>{lead.project}</p>
        </div>
      )}

      {/* Mensagem (expansível) */}
      {lead.message && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-left w-full"
          >
            <p className={`text-[0.8rem] text-white/60 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {lead.message}
            </p>
            {lead.message.length > 120 && (
              <span className="text-[0.7rem] text-gold/80 hover:text-gold flex items-center gap-1 mt-1">
                {expanded ? 'Ver menos' : 'Ver mais'}
                <ChevronDown className={`w-3 h-3 transition ${expanded ? 'rotate-180' : ''}`} />
              </span>
            )}
          </button>
        </div>
      )}

      {/* Ações primárias — WhatsApp e Ligar */}
      <div className="flex flex-wrap gap-2 mb-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-[#25d366] text-white text-[0.82rem] font-medium rounded-md hover:brightness-110 transition"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        <a
          href={`tel:+55${lead.phone}`}
          className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 border border-white/15 text-white text-[0.82rem] font-medium rounded-md hover:bg-white/10 transition"
        >
          <Phone className="w-4 h-4" />
          {phoneFormatted}
        </a>
        {lead.email && (
          <a
            href={`mailto:${lead.email}?subject=${encodeURIComponent('Pedido de orçamento - Leal Glass')}`}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 border border-white/15 text-white text-[0.82rem] rounded-md hover:bg-white/10 transition"
            title={lead.email}
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Ações de status */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
        {lead.status !== 'contacted' && lead.status !== 'done' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus('contacted')}
            disabled={updating}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 h-8 text-[0.72rem]"
          >
            {updating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Phone className="w-3 h-3 mr-1" />}
            Marcar contatado
          </Button>
        )}
        {lead.status !== 'done' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus('done')}
            disabled={updating}
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 h-8 text-[0.72rem]"
          >
            {updating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
            Concluir
          </Button>
        )}
        {lead.status === 'done' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus('new')}
            disabled={updating}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 h-8 text-[0.72rem]"
          >
            {updating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Circle className="w-3 h-3 mr-1" />}
            Reabrir
          </Button>
        )}
        <span className="ml-auto text-[0.7rem] text-white/30">
          {formatDate(lead.createdAt)}
        </span>
      </div>

      {/* Assigned to */}
      {lead.assignedTo && (
        <p className="text-[0.7rem] text-white/30 mt-2">
          Sendo atendido por: {lead.assignedTo}
        </p>
      )}
    </article>
  );
}
