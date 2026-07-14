'use client';

/**
 * Página /contato
 *
 * Quadro completo de canais de contato + formulário genérico com upload de documentos.
 *
 * Upload aceita: PDF, DWG, DXF, JPG, PNG, WebP — até 4 MB por arquivo, até 3 arquivos.
 * Arquivos são enviados via FormData para /api/contato, que anexa no email via Resend.
 */

import { useState, type FormEvent, type ChangeEvent, type DragEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Upload,
  X,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const NAV_LINKS = [
  { label: 'Sistemas', href: '/#sistemas' },
  { label: 'Obras', href: '/#obras' },
  { label: 'Processo', href: '/#processo' },
  { label: 'Diferenciais', href: '/#diferenciais' },
  { label: 'Depoimentos', href: '/#depoimentos' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contato', href: '/contato' },
  { label: 'Privacidade', href: '/politica-de-privacidade' },
];

const PHONE_COMMERCIAL = '(41) 3057-0873';
const PHONE_WHATSAPP = '(41) 99861-2093';
const WHATSAPP_NUMBER = '5541998612093';
const EMAIL = 'contato@lealglass.com.br';
const ADDRESS = {
  street: 'R. Antonio Ribeiro Macedo, 295',
  district: 'Xaxim',
  city: 'Curitiba — PR',
  zip: 'CEP 81.810-250',
};

const SUBJECTS = [
  { value: 'orcamento', label: 'Solicitação de orçamento' },
  { value: 'documentos', label: 'Envio de documentos e desenhos' },
  { value: 'suporte', label: 'Suporte técnico / pós-venda' },
  { value: 'parceria', label: 'Parceria com construtora/incorporadora' },
  { value: 'carreira', label: 'Trabalhe conosco' },
  { value: 'outro', label: 'Outro assunto' },
] as const;

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB (limite Vercel)
const MAX_FILES = 3;
const ACCEPTED_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.webp'];

type FileItem = {
  file: File;
  id: string;
};

export default function ContatoClient() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: '' as (typeof SUBJECTS)[number]['value'] | '',
    message: '',
    consent: false,
  });
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    addFiles(newFiles);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }

  function addFiles(newFiles: File[]) {
    const valid: FileItem[] = [];
    const errorsList: string[] = [];

    for (const file of newFiles) {
      if (files.length + valid.length >= MAX_FILES) {
        errorsList.push(`Máximo de ${MAX_FILES} arquivos.`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        errorsList.push(`${file.name}: arquivo maior que 4 MB.`);
        continue;
      }
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAcceptedExt = ACCEPTED_EXTENSIONS.includes(ext);
      if (!isAcceptedExt) {
        errorsList.push(
          `${file.name}: tipo não suportado. Aceitos: ${ACCEPTED_EXTENSIONS.join(', ')}`
        );
        continue;
      }
      valid.push({ file, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
    }

    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
    }
    if (errorsList.length > 0) {
      errorsList.forEach((msg) => toast.error(msg));
    }
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Informe seu nome.';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido.';
    }
    if (!form.subject) {
      newErrors.subject = 'Selecione o assunto.';
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = 'Escreva sua mensagem (mínimo 10 caracteres).';
    }
    if (!form.consent) {
      newErrors.consent = 'É necessário aceitar a política de privacidade.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('company', form.company);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('subject', form.subject);
      formData.append('message', form.message);
      formData.append('consent', String(form.consent));
      files.forEach((f) => formData.append('files', f.file));

      const res = await fetch('/api/contato', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Erro ${res.status}`);
      }

      setSent(true);
      toast.success('Mensagem enviada com sucesso!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Erro ao enviar. Tente novamente ou use o WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="min-h-[100svh] flex items-center justify-center px-6 py-20 bg-background">
        <div className="max-w-[560px] w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-dim border border-gold-border mb-8">
            <CheckCircle2 className="w-10 h-10 text-gold" strokeWidth={1.25} />
          </div>
          <span className="eyebrow eyebrow-center mb-5">Mensagem enviada</span>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-tight mb-5">
            Recebemos sua <span className="text-gold italic">mensagem.</span>
          </h1>
          <p className="text-muted-brand text-[1rem] leading-relaxed mb-10">
            Obrigado pelo contato. Nossa equipe responderá em até{' '}
            <span className="text-foreground">1 dia útil</span>. Para assuntos
            urgentes, ligue para <span className="text-gold">{PHONE_COMMERCIAL}</span>{' '}
            ou chame no WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25d366] text-white text-[0.88rem] font-medium rounded-md hover:brightness-110 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 border border-white/12 text-[0.88rem] text-foreground rounded-md hover:border-white/30 hover:bg-white/[0.03] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Header fixo com navegação */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Leal Glass — início">
            <Image
              src="/logo-navbar.png"
              alt="Logotipo Leal Glass"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              priority
            />
            <span className="font-display text-xl tracking-tight text-foreground">
              Leal <span className="text-gold italic">Glass</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[0.82rem] transition-colors ${
                  l.href === '/contato'
                    ? 'text-gold'
                    : 'text-muted-brand hover:text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/#orcamento"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gold text-background text-[0.78rem] font-medium rounded-md hover:bg-gold-light transition"
            >
              Diagnóstico gratuito
            </Link>
            <Link
              href="/"
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 border border-white/[0.12] text-[0.78rem] text-foreground rounded-md hover:border-white/30 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Início
            </Link>
          </div>
        </div>

        <nav className="lg:hidden flex items-center gap-4 px-6 pb-3 overflow-x-auto border-t border-white/[0.04]">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[0.78rem] whitespace-nowrap transition-colors ${
                l.href === '/contato'
                  ? 'text-gold'
                  : 'text-muted-brand hover:text-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-h-[100svh] bg-background pt-32 lg:pt-28 pb-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          {/* Header da página */}
          <motion.div
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-[680px] mb-14"
          >
            <span className="eyebrow mb-5">Fale com a Leal Glass</span>
            <h1 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-foreground mb-5">
              Entre em <span className="text-gold italic">contato</span>
            </h1>
            <p className="text-[1.05rem] leading-relaxed text-muted-brand">
              Para orçamentos, parcerias, envio de documentos e desenhos técnicos
              ou qualquer outro assunto. Respondemos em até 1 dia útil.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
            {/* Quadro de contatos */}
            <motion.aside
              initial={{ x: -12 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-5"
            >
              {/* Telefones */}
              <div className="bg-surface border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-[0.72rem] font-mono-brand uppercase tracking-[0.18em] text-gold mb-5">
                  Telefones
                </h2>
                <ul className="space-y-4">
                  <li>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        'Olá! Vim pelo site da Leal Glass.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#25d366]/15 border border-[#25d366]/30 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-[#25d366]" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-0.5">
                          WhatsApp comercial
                        </p>
                        <p className="text-[0.95rem] text-foreground group-hover:text-gold transition-colors">
                          {PHONE_WHATSAPP}
                        </p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="tel:+554130570873" className="flex items-start gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-gold-dim border border-gold-border flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-gold" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-0.5">
                          Fixo comercial
                        </p>
                        <p className="text-[0.95rem] text-foreground group-hover:text-gold transition-colors">
                          {PHONE_COMMERCIAL}
                        </p>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Email */}
              <div className="bg-surface border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-[0.72rem] font-mono-brand uppercase tracking-[0.18em] text-gold mb-5">
                  Email
                </h2>
                <a
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                    'Contato — Site Leal Glass'
                  )}&body=${encodeURIComponent(
                    'Olá, vim pelo site da Leal Glass.\n\nNome: \nTelefone: \nAssunto: \nMensagem: '
                  )}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gold-dim border border-gold-border flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-gold" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Atendimento comercial
                    </p>
                    <p className="text-[0.95rem] text-foreground group-hover:text-gold transition-colors break-all">
                      {EMAIL}
                    </p>
                  </div>
                </a>
                <p className="mt-4 text-[0.78rem] text-muted-foreground leading-relaxed">
                  Para assuntos de LGPD (Lei Geral de Proteção de Dados):
                  {' '}
                  <a
                    href="mailto:sistemas@lealglass.com.br"
                    className="text-gold hover:text-gold-light underline underline-offset-2"
                  >
                    sistemas@lealglass.com.br
                  </a>
                </p>
              </div>

              {/* Endereço */}
              <div className="bg-surface border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-[0.72rem] font-mono-brand uppercase tracking-[0.18em] text-gold mb-5">
                  Endereço
                </h2>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-dim border border-gold-border flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gold" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[0.95rem] text-foreground">{ADDRESS.street}</p>
                    <p className="text-[0.85rem] text-muted-brand">
                      {ADDRESS.district}
                      <br />
                      {ADDRESS.city}
                      <br />
                      {ADDRESS.zip}
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Leal+Glass+Esquadrias+Curitiba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-[0.8rem] text-gold hover:text-gold-light transition"
                >
                  Ver no Google Maps
                  <ArrowRight className="w-3 h-3" strokeWidth={2} />
                </a>
              </div>

              {/* Horário */}
              <div className="bg-surface border border-white/[0.06] rounded-xl p-6">
                <h2 className="text-[0.72rem] font-mono-brand uppercase tracking-[0.18em] text-gold mb-5">
                  Horário de atendimento
                </h2>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-dim border border-gold-border flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gold" strokeWidth={1.75} />
                  </div>
                  <div className="text-[0.9rem]">
                    <p className="text-foreground">Segunda a sexta-feira</p>
                    <p className="text-muted-brand">8h às 18h</p>
                    <p className="text-foreground mt-2">Sábado</p>
                    <p className="text-muted-brand">8h às 12h</p>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Formulário */}
            <motion.div
              initial={{ x: 12 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-surface border border-white/[0.06] rounded-xl p-6 lg:p-10"
            >
              <h2 className="font-display text-2xl tracking-tight text-foreground mb-2">
                Envie sua mensagem
              </h2>
              <p className="text-[0.88rem] text-muted-brand mb-8">
                Para orçamentos, prefira o{' '}
                <Link href="/#orcamento" className="text-gold hover:text-gold-light underline underline-offset-2">
                  formulário de diagnóstico
                </Link>
                . Para outros assuntos, use o formulário abaixo.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Nome + Empresa */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cName" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                      Nome *
                    </label>
                    <Input
                      id="cName"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Seu nome"
                      className="form-input"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cCompany" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                      Empresa <span className="text-muted-foreground/60 normal-case tracking-normal">(opcional)</span>
                    </label>
                    <Input
                      id="cCompany"
                      type="text"
                      autoComplete="organization"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Sua empresa"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Email + Telefone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cEmail" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                      Email *
                    </label>
                    <Input
                      id="cEmail"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="voce@email.com"
                      className="form-input"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cPhone" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                      Telefone <span className="text-muted-foreground/60 normal-case tracking-normal">(opcional)</span>
                    </label>
                    <Input
                      id="cPhone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(41) 99999-9999"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Assunto */}
                <div>
                  <label htmlFor="cSubject" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                    Assunto *
                  </label>
                  <select
                    id="cSubject"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value as (typeof SUBJECTS)[number]['value'] })
                    }
                    className="form-input w-full h-[44px] px-3 rounded-md text-[0.9rem] text-foreground bg-surface2 border border-white/[0.12] focus:border-gold focus:outline-none transition-colors cursor-pointer appearance-none"
                    style={{
                      colorScheme: 'dark',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A24B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px',
                    }}
                    aria-invalid={!!errors.subject}
                  >
                    <option value="" className="bg-[#07080C] text-white/50">
                      Selecione o assunto…
                    </option>
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#07080C] text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> {errors.subject}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label htmlFor="cMessage" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                    Mensagem *
                  </label>
                  <Textarea
                    id="cMessage"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Descreva seu pedido, dúvida ou proposta…"
                    className="form-input resize-y min-h-[120px]"
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </p>
                  )}
                </div>

                {/* Upload de arquivos */}
                <div>
                  <label className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                    Anexos <span className="text-muted-foreground/60 normal-case tracking-normal">(opcional)</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                      dragActive
                        ? 'border-gold bg-gold-dim/10'
                        : 'border-white/[0.12] hover:border-white/25'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[0.88rem] text-muted-brand mb-1">
                      Arraste arquivos aqui ou{' '}
                      <label className="text-gold hover:text-gold-light underline underline-offset-2 cursor-pointer">
                        clique para selecionar
                        <input
                          type="file"
                          multiple
                          accept={ACCEPTED_EXTENSIONS.join(',')}
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                    </p>
                    <p className="text-[0.72rem] text-muted-foreground">
                      PDF, DWG, DXF, JPG, PNG, WebP · até 4 MB por arquivo · máx. 3 arquivos
                    </p>
                  </div>

                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((f) => (
                        <li
                          key={f.id}
                          className="flex items-center gap-3 bg-surface2 border border-white/[0.08] rounded-md p-3"
                        >
                          <FileText className="w-4 h-4 text-gold flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.85rem] text-foreground truncate">
                              {f.file.name}
                            </p>
                            <p className="text-[0.7rem] text-muted-foreground">
                              {formatBytes(f.file.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(f.id)}
                            aria-label={`Remover ${f.file.name}`}
                            className="text-muted-foreground hover:text-red-400 transition flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Consentimento LGPD */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      className="mt-1 w-4 h-4 accent-gold cursor-pointer"
                      aria-invalid={!!errors.consent}
                    />
                    <span className="text-[0.8rem] text-muted-brand leading-relaxed">
                      Li e concordo com a{' '}
                      <Link
                        href="/politica-de-privacidade"
                        className="text-gold hover:text-gold-light underline underline-offset-2"
                      >
                        Política de Privacidade
                      </Link>{' '}
                      e autorizo o contato comercial conforme a Lei 13.709/2018 (LGPD).
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> {errors.consent}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-background hover:bg-gold-light font-medium h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      Enviar mensagem
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-[0.72rem] text-muted-foreground text-center">
                  Resposta em até 1 dia útil. Para urgências, ligue{' '}
                  <a href="tel:+554130570873" className="text-gold hover:text-gold-light">
                    {PHONE_COMMERCIAL}
                  </a>
                  .
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
