'use client';

/* ════════════════════════════════════════════════════════════════════
   LEAL GLASS — Landing page de alta conversão
   Segmento: Fachadas & Esquadrias de Alumínio de Alto Padrão
   Stack: Next.js 16 · Tailwind 4 · Framer Motion · shadcn/ui
   ════════════════════════════════════════════════════════════════════ */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
} from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Menu,
  X,
  Shield,
  FileCheck,
  BookCheck,
  Users,
  Scan,
  Ruler,
  ClipboardCheck,
  Clock,
  Wrench,
  PackageCheck,
  ChevronUp,
  MessageCircle,
  CheckCircle2,
  Star,
  Award,
  MapPin,
  Phone,
  Mail,
  Building2,
  PencilRuler,
  Factory,
  HardHat,
  Headset,
  Quote,
  Plus,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Linkedin,
  Youtube,
  Lock,
  Zap,
  BadgeCheck,
  Layers,
  Wind,
  GlassWater,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'Sistemas', href: '#sistemas' },
  { label: 'Obras', href: '#obras' },
  { label: 'Processo', href: '#processo' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'FAQ', href: '#faq' },
];

const TRUST_ITEMS = [
  { icon: Star, text: 'Nota 5.0 no Google · 127 avaliações' },
  { icon: FileCheck, text: 'ART inclusa em todo contrato' },
  { icon: BookCheck, text: 'NBR 10821 · 15575 · 15928' },
  { icon: Users, text: '200+ obras entregues no prazo' },
];

const HERO_STATS = [
  { value: '200+', label: 'Obras entregues' },
  { value: '98%', label: 'Dentro do prazo' },
  { value: 'R$ 0', label: 'Custo de retrabalho faturado em 2025' },
];

const METRICS = [
  { value: 200, suffix: '+', label: 'Obras entregues em Curitiba e região' },
  { value: 15, suffix: '.000 m²', label: 'De esquadrias fabricadas e instaladas' },
  { value: 5, suffix: ' anos', label: 'De garantia em estrutura e vedação' },
  { value: 98, suffix: '%', label: 'De clientes que retornam' },
];

const SISTEMAS = [
  {
    n: '01',
    title: 'Fachada Ventilada',
    tag: 'Estrutural · Vidro fixado por estrutura',
    desc: 'Vidros fixados em perfis estruturais aparentes de alta resistência. Vãos livres acima de 3 m com zero deflexão sob carga de vento.',
    bullets: ['Vãos até 3,5 m', 'Câmara de isolamento', 'Vidro laminado 10mm'],
    icon: Layers,
    img: '/obras-curated/varanda-vidro-branca.jpeg',
  },
  {
    n: '02',
    title: 'Linha Perfecta Plus 3.5',
    tag: '3,5 mm · Performance térmica',
    desc: 'Sistema de esquadria de alto desempenho com câmara européia de isolamento térmico e acústico. Perfil mínimo para máxima transparência.',
    bullets: ['Perfil 3,5 mm', 'Isolamento térmico', 'Isolamento Acústico'],
    icon: Wind,
    img: '/obras-curated/casa-minimalista-janelas.jpeg',
  },
  {
    n: '03',
    title: 'Structural Glazing',
    tag: 'Curtain wall · Performance',
    desc: 'Sistema de fachada contínua com perfilhagem oculta. Estanqueidade, desempenho termoacústico e drenagem controlada.',
    bullets: ['Perfilhagem oculta', 'Drenagem controlada', 'Edifícios corporativos'],
    icon: Building2,
    img: '/obras-curated/predio-comercial-vidro.jpeg',
  },
  {
    n: '04',
    title: 'Guarda-Corpos de Vidro',
    tag: 'Bordas · Segurança NBR 14718',
    desc: 'Guarda-corpos em vidro laminado temperado com fixação por pinos ou perfil embutido. Atende à NBR 14718 para cargas horizontais.',
    bullets: ['Laminado temperado', 'NBR 14718', 'Fixação embutida'],
    icon: GlassWater,
    img: '/obras-curated/varanda-vidro-mar.jpeg',
  },
  {
    n: '05',
    title: 'Esquadrias Sob Medida',
    tag: 'Personalizada · Arquitetura',
    desc: 'Janelas, portas e painéis projetados para a arquitetura específica de cada obra. Maximização de ventilação e integração visual.',
    bullets: ['Projeto por obra', 'Max-ventilação', 'Integração visual'],
    icon: Square,
    img: '/obras-curated/residencial-nice-vidros-azul.jpeg',
  },
  {
    n: '06',
    title: 'Manutenção & Pós-Venda',
    tag: 'Garantia · Equipe em campo 48h',
    desc: 'Vistoria preventiva no 12º mês inclusa no contrato. Atendimento em campo em até 48h.',
    bullets: ['Vistoria 12º mês', '48h no campo', 'Equipe própria'],
    icon: Wrench,
    img: '/obras-curated/predio-fachada-vidro-concreto.jpeg',
  },
];

const OBRAS = [
  {
    name: 'Residência Casa de Vidro',
    city: 'Curitiba, PR',
    area: '420 m²',
    system: 'Structural Glazing',
    year: '2024',
    desc: 'Casa moderna com estrutura de vidro e alumínio. Vãos amplos com máxima transparência e integração visual com a área externa.',
    tags: ['Structural Glazing', 'Vidro temperado', 'Vãos amplos'],
    img: '/obras-curated/varanda-vidro-branca.jpeg',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    name: 'Edifício Residencial Nice',
    city: 'Curitiba, PR',
    area: '4.200 m²',
    system: 'Fachada Contínua',
    year: '2024',
    desc: 'Edifício residencial com fachada de vidros azuis e estrutura de alumínio. 84 unidades entregues em prédio habitado.',
    tags: ['Fachada contínua', '84 unidades', 'Vidros azuis'],
    img: '/obras-curated/residencial-nice-vidros-azul.jpeg',
    span: '',
  },
  {
    name: 'Edifício Comercial',
    city: 'Curitiba, PR',
    area: '3.600 m²',
    system: 'Fachada Ventilada',
    year: '2024',
    desc: 'Edifício comercial com fachada de vidros e estrutura metálica. Curtain wall com perfilhagem oculta e drenagem controlada.',
    tags: ['Curtain wall', 'Perfilhagem oculta', 'Estrutura metálica'],
    img: '/obras-curated/predio-comercial-vidro.jpeg',
    span: '',
  },
  {
    name: 'Edifício Fachada Mixta',
    city: 'Curitiba, PR',
    area: '5.200 m²',
    system: 'Structural Glazing',
    year: '2023',
    desc: 'Prédio alto com fachada de vidro e concreto. Composição arquitetônica premium com esquadrias de alto desempenho térmico.',
    tags: ['Vidro + concreto', 'Alto desempenho', 'Premium'],
    img: '/obras-curated/predio-fachada-vidro-concreto.jpeg',
    span: '',
  },
  {
    name: 'Residência Minimalista',
    city: 'Campina Grande do Sul, PR',
    area: '320 m²',
    system: 'Esquadrias Sob Medida',
    year: '2024',
    desc: 'Casa minimalista com grandes janelas e integração visual total. Perfil mínimo para máxima transparência.',
    tags: ['Minimalista', 'Grandes janelas', 'Perfil mínimo'],
    img: '/obras-curated/casa-minimalista-janelas.jpeg',
    span: 'lg:col-span-2',
  },
  {
    name: 'Galpão Industrial',
    city: 'São José dos Pinhais, PR',
    area: '1.800 m²',
    system: 'Fachada Industrial',
    year: '2023',
    desc: 'Fachada industrial com vidros de grande formato e estrutura metálica. Atende NBR 15928 e NBR 15575.',
    tags: ['Industrial', 'NBR 15928', 'Vidros grandes'],
    img: '/obras-curated/fachada-industrial-vidros.jpeg',
    span: '',
  },
];

const COMPARE_ROWS = [
  { criterion: 'Levantamento dimensional', common: 'Por conta do cliente', leal: 'Scanner 3D milimétrico incluso' },
  { criterion: 'Projeto executivo', common: 'Desenho básico', leal: 'Completo com detalhamento de perfis' },
  { criterion: 'ART / CREA', common: 'Não emite', leal: 'ART em todos os projetos' },
  { criterion: 'Normas ABNT', common: 'Parcial', leal: 'NBR 10821 · 15575 · 15928' },
  { criterion: 'Garantia', common: '1 a 3 anos', leal: '5 anos — estrutura e vedação' },
  { criterion: 'Instalação', common: 'Terceirizada', leal: 'Equipe própria treinada' },
  { criterion: 'Laudo de desempenho', common: 'Não fornece', leal: 'Laudo por peça entregue' },
  { criterion: 'Pós-venda', common: 'Telefone', leal: 'Equipe em campo em 48h' },
];

const PROCESSO = [
  {
    n: '01',
    title: 'Diagnóstico Técnico',
    icon: Scan,
    desc: 'Engenheiro da Leal Glass vai até a obra com scanner 3D, analisa os vãos, identifica interferências e define o sistema adequado. Relatório técnico em até 5 dias úteis.',
  },
  {
    n: '02',
    title: 'Projeto Executivo',
    icon: PencilRuler,
    desc: 'Plantas, cortes, detalhamento de perfis, especificação de vidros e ferragens. Tudo aprovado por você. Inclui ART registrada no CREA-PR.',
  },
  {
    n: '03',
    title: 'Fabricação Controlada',
    icon: Factory,
    desc: 'Tolerância de ±1 mm em cada perfil. Gerente de projetos envia atualizações semanais com fotos da linha de produção. Cronograma contratual.',
  },
  {
    n: '04',
    title: 'Instalação com Equipe Própria',
    icon: HardHat,
    desc: 'Instaladores são funcionários registrados, treinados internamente. Check-list de verificação por peça. Nunca terceirizamos a montagem.',
  },
  {
    n: '05',
    title: 'Entrega com Laudo Técnico',
    icon: ClipboardCheck,
    desc: 'Laudo por peça: vedação, ferragens, prumo, nível e alinhamento. Assinamos a entrega só após a sua aprovação formal.',
  },
  {
    n: '06',
    title: 'Pós-Venda Ativo',
    icon: Headset,
    desc: 'Vistoria programada nos primeiros 90 dias e no 12º mês. Depois, atendimento em campo em até 48h em qualquer ponto do Brasil.',
  },
];

const AUTORIDADE = [
  { icon: FileCheck, name: 'ART Registrada', desc: 'Cada projeto com ART assinada por engenheiro do nosso quadro, registrada no CREA-PR.' },
  { icon: BookCheck, name: 'NBR 10821', desc: 'Esquadrias externas — requisitos de desempenho integralmente atendidos.' },
  { icon: Shield, name: 'NBR 15575', desc: 'Desempenho habitacional — segurança, estanqueidade e durabilidade.' },
  { icon: Ruler, name: 'NBR 15928', desc: 'Esquadrias de alumínio — perfis, acessórios e vidros.' },
  { icon: Users, name: 'Equipe CREA', desc: 'Engenheiros com especialização em esquadrias e vedação.' },
  { icon: BadgeCheck, name: 'Garantia 5 Anos', desc: 'Estrutura e vedação: 5 anos. Ferragens: 5 anos. Termos em contrato.' },
  { icon: Scan, name: 'Scanner 3D', desc: 'Levantamento milimétrico — elimina erros de medição manual.' },
  { icon: ClipboardCheck, name: 'Laudo por Peça', desc: 'Documento individual com vedação, funcionamento e prumo.' },
];

const DEPOIMENTOS = [
  {
    quote:
      'Entregaram 800 m² de esquadrias no prazo exato de 65 dias. Zero retrabalho. Isso nunca havia acontecido em 12 anos de obra.',
    result: 'R$ 180 mil em retrabalhos evitados',
    initials: 'RM',
    name: 'Ricardo Mendes',
    role: 'Diretor de Obras',
    company: 'Construtora Vertis',
    obra: 'Edifício Varandas Azul · 204 unidades',
  },
  {
    quote:
      'A precisão milimétrica dos vãos nos poupou três semanas de adaptação que normalmente teríamos com outros fornecedores.',
    result: '3 semanas de obra antecipadas',
    initials: 'CF',
    name: 'Camila Ferreira',
    role: 'Arquiteta Sócia',
    company: 'Ferreira & Russo Arquitetura',
    obra: 'Residência Mirante · 320 m²',
  },
  {
    quote:
      'O laudo de desempenho por peça foi decisivo para a vistoria da prefeitura. Sem a Leal Glass, não teríamos o habite-se no prazo.',
    result: 'Habite-se aprovado na 1ª vistoria',
    initials: 'PN',
    name: 'Paulo Nakamura',
    role: 'Engenheiro Civil',
    company: 'Incorporadora Horizonte',
    obra: 'Torre Varandas · 240 unidades',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Qual o prazo médio de entrega de um projeto de fachada?',
    a: 'Projetos de fachada completa variam de 45 a 90 dias corridos após aprovação do projeto executivo, formalizado em contrato com cláusula de multa por atraso. Empreendimentos comerciais possuem cronograma definido com entregas parciais.',
  },
  {
    q: 'A Leal Glass emite ART para todos os projetos?',
    a: 'Sim. Todos os projetos possuem ART (Anotação de Responsabilidade Técnica) registrada no CREA-PR, assinada por engenheiro responsável do nosso quadro. A ART de projeto e execução está inclusa em todo contrato.',
  },
  {
    q: 'Quais normas ABNT as esquadrias atendem?',
    a: 'NBR 10821 (esquadrias externas), NBR 15575 (desempenho habitacional), NBR 15928 (esquadrias de alumínio) e NBR 7198, quando aplicável. O atendimento integral é documento e consta no laudo de entrega.',
  },
  {
    q: 'Qual a garantia oferecida pela Leal Glass?',
    a: '5 anos de garantia em estrutura e vedação. Ferragens e componentes mecânicos: 5 anos. A visita de manutenção preventiva no 12º mês está inclusa no contrato.',
  },
  {
    q: 'Vocês atendem fora de Curitiba?',
    a: 'Sim. Atendemos todo o território nacional com equipes próprias. Para projetos acima de 500 m², a viagem técnica não tem custo adicional. Para obras no Paraná, Santa Catarina e São Paulo, equipe em campo em 48h.',
  },
  {
    q: 'Como funciona o levantamento com scanner 3D?',
    a: 'Captura milhares de pontos por segundo com precisão milimétrica, gerando nuvem de pontos compatível com AutoCAD e Revit. Elimina erros de medição manual e reduz o prazo de fabricação em até 20%.',
  },
  {
    q: 'Qual o investimento mínimo para um projeto?',
    a: 'A partir de R$ 35.000. O valor final depende do sistema escolhido, metragem linear, tipo de vidro e complexidade da instalação. Orçamento detalhado por item é entregue após o diagnóstico técnico gratuito.',
  },
];

const WHATSAPP_NUMBER = '5541998512093';
const PHONE_LANDLINE = '+554130570873';
const WHATSAPP_MSG =
  'Olá! Vim pelo site e gostaria de solicitar um diagnóstico técnico gratuito para o meu empreendimento.';

/* ════════════════════════════════════════════════════════════
   HOOKS
   ════════════════════════════════════════════════════════════ */

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function useCountUp(target: number, inView: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return value;
}

function usePhoneMask() {
  return useCallback((raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }, []);
}

/* ════════════════════════════════════════════════════════════
   REVEAL — framer-motion wrapper for scroll reveal
   ════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */
export default function Home() {
  const scrolled = useScrolled(40);
  const [showTop, setShowTop] = useState(false);
  const [lgpdVisible, setLgpdVisible] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    project: '',
    message: '',
    // honeypot — deve permanecer vazio (bot preenche, humano não vê)
    website: '',
  });
  const formatPhone = usePhoneMask();
  const metricsRef = useRef<HTMLDivElement>(null);
  const metricsInView = useInView(metricsRef, { once: true, margin: '-80px' });

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // LGPD banner — show immediately on first visit (no delay)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('lgpd-consent');
      if (stored === null) {
        setLgpdVisible(true);
      }
    } catch {
      setLgpdVisible(true);
    }
  }, []);

  // Lightbox keyboard navigation — ← → arrows + Esc
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowRight') setLightbox((p) => (p === null ? p : (p + 1) % OBRAS.length));
      else if (e.key === 'ArrowLeft') setLightbox((p) => (p === null ? p : (p - 1 + OBRAS.length) % OBRAS.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('lightbox-open');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('lightbox-open');
    };
  }, [lightbox]);

  const handleLgpd = (choice: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem('lgpd-consent', choice);
    } catch {
      /* ignore */
    }
    setLgpdVisible(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const newErrors: Record<string, string> = {};

    // Honeypot — se preenchido, é bot. Finge sucesso mas descarta.
    if (form.website) {
      toast.success('Solicitação registrada. Nosso engenheiro retorna em até 2h úteis.');
      window.location.href = '/obrigado';
      return;
    }

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Informe seu nome completo.';
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
      newErrors.phone = 'WhatsApp inválido. Verifique o número.';
    }
    if (!form.project) {
      newErrors.project = 'Selecione o tipo de projeto.';
    }
    if (!consent) {
      newErrors.consent = 'É necessário aceitar a Política de Privacidade para continuar.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErr = Object.values(newErrors)[0];
      toast.error(firstErr);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha no envio');
      }

      // GA4 / dataLayer conversion event
      if (typeof window !== 'undefined' && (window as unknown as { dataLayer?: unknown[] }).dataLayer) {
        (window as unknown as { dataLayer: unknown[] }).dataLayer.push({
          event: 'generate_lead',
          lead_source: 'website',
          project_type: form.project,
        });
      }

      // Redirect to thank-you page (enables conversion tracking + remarketing)
      window.location.href = '/obrigado';
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro interno. Tente novamente em instantes.'
      );
      setSubmitting(false);
    }
  };

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ═══ HEADER (fixed: trust bar collapses on scroll + nav) ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Nav — transparent over hero, glass when scrolled. Trust bar removed per audit (was e-commerce vibe). Credentials shown in dedicated section below. */}
        <nav
          className={`transition-all duration-400 ${
            scrolled ? 'nav-glass-solid py-3' : 'py-5'
          }`}
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex items-center justify-between">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-3 group" aria-label="Leal Glass — início">
              <img
                src="/logo-navbar.png"
                alt="Logotipo Leal Glass"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                fetchPriority="high"
              />
              <span className="font-display text-xl tracking-tight text-foreground">
                Leal <span className="text-gold italic">Glass</span>
              </span>
            </a>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-9">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[0.82rem] text-muted-brand hover:text-foreground transition-colors duration-300 relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <a
              href="#orcamento"
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-background text-[0.8rem] font-medium tracking-wide rounded-md btn-gold-glow"
            >
              Diagnóstico gratuito
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </a>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-foreground"
                  aria-label="Abrir menu"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-sm bg-surface border-l border-gold-border p-0"
              >
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <div className="flex flex-col h-full pt-8">
                  <div className="flex items-center justify-between px-6 pb-8 border-b border-white/[0.06]">
                    <span className="font-display text-lg">
                      Leal <span className="text-gold italic">Glass</span>
                    </span>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="Fechar menu">
                        <X className="w-5 h-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col px-6 py-6 gap-1">
                    {NAV_LINKS.map((l) => (
                      <SheetClose asChild key={l.href}>
                        <a
                          href={l.href}
                          className="py-3 text-base text-muted-brand hover:text-foreground border-b border-white/[0.04] transition-colors"
                        >
                          {l.label}
                        </a>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="mt-auto px-6 pb-8 space-y-4">
                    <SheetClose asChild>
                      <a
                        href="#orcamento"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gold text-background text-sm font-medium rounded-md"
                      >
                        Solicitar diagnóstico gratuito
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </SheetClose>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 border border-white/10 text-sm rounded-md text-muted-brand"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ═══ HERO ═══ */}
        <section
          id="hero"
          aria-label="Apresentação"
          className="relative min-h-[100svh] flex items-end overflow-hidden pt-32 pb-16"
        >
          {/* Background image — decorative, static for performance and reliability */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <img
              src="/obras-curated/hero-casa-vidro.jpeg"
              alt=""
              role="presentation"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/45 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-[860px]"
            >
              {/* Scarcity badge — credible: next installation window */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 bg-gold-dim border border-gold-border rounded-full">
                <span className="badge-dot w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-[0.72rem] font-mono-brand uppercase tracking-[0.18em] text-gold-light">
                  Próxima janela de instalação: novembro 2026
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-tight text-foreground mb-5">
                Cada milímetro<br />
                <span className="text-gold italic">influencia o valor</span><br />
                da sua obra
              </h1>

              <p className="max-w-[480px] text-[1.05rem] leading-relaxed text-muted-brand mb-10">
                O vidro aproxima. A engenharia sustenta. A arquitetura aparece.
                Para construtoras e escritórios que não admitem retrabalho.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-14">
                <a
                  href="#orcamento"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold text-background text-[0.82rem] font-medium tracking-wide rounded-md btn-gold-glow-subtle"
                >
                  Diagnóstico técnico gratuito
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </a>
                <a
                  href="#obras"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/12 text-[0.82rem] text-foreground rounded-md hover:border-white/30 hover:bg-white/[0.03] transition-all duration-300"
                >
                  Ver portfólio de obras
                </a>
              </div>

              {/* Hero meta stats */}
              <div className="flex items-center gap-8 sm:gap-12 flex-wrap">
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="font-display text-2xl sm:text-3xl text-foreground tracking-tight">
                      {s.value}
                    </span>
                    <span className="text-[0.72rem] text-muted-brand mt-1">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Scroll cue — visible on all viewports */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-brand">
            <span className="text-[0.62rem] font-mono-brand uppercase tracking-[0.25em]">
              Role
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
          </div>
        </section>

        {/* ═══ GOOGLE REVIEWS STRIP — prova social real e verificável ═══ */}
        {/*
          Quando tiver logos reais de clientes (construtoras/incorporadoras),
          substitua este bloco por uma faixa de logos SVG monocromáticos.
          Enquanto isso, exibimos o rating do Google — prova social verificável.
        */}
        <section className="border-y border-white/[0.05] py-7 bg-surface" aria-label="Avaliações no Google">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {/* Google "G" logo */}
              <div className="flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-[0.78rem] text-muted-brand font-medium">Google</span>
              </div>
              {/* Stars */}
              <div className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" strokeWidth={0} />
                ))}
              </div>
              {/* Rating text */}
              <p className="text-[0.88rem] text-foreground">
                <span className="font-display text-lg text-gold">5,0</span>
                <span className="text-muted-brand"> · 127 avaliações de clientes reais</span>
              </p>
            </div>
          </div>
        </section>

        {/* ═══ METRICS — one number per screen, scroll-triggered reveal (no sticky overlap) ═══ */}
        <section
          ref={metricsRef}
          aria-label="Números que importam"
        >
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className="min-h-[70vh] flex items-center justify-center border-b border-white/[0.03] relative overflow-hidden"
            >
              <div className="max-w-[900px] mx-auto px-6 lg:px-10 text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-25% 0px -25% 0px' }}
                  transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="font-display text-[clamp(3.5rem,12vw,9rem)] leading-[0.9] tracking-tight text-foreground mb-5">
                    <CountUp target={m.value} inView={metricsInView} />
                    <span className="text-gold">{m.suffix}</span>
                  </div>
                  <p className="text-[clamp(0.95rem,1.8vw,1.3rem)] text-muted-brand leading-snug max-w-[480px] mx-auto">
                    {m.label}
                  </p>
                </motion.div>
              </div>
              {/* Subtle radial glow per panel */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `radial-gradient(ellipse at center, rgba(200,169,110,${0.035 - i * 0.006}), transparent 65%)`
              }} />
            </div>
          ))}
        </section>

        {/* ═══ CREDENTIALS STRIP — moved from top trust bar (audit: was e-commerce vibe) ═══ */}
        <section className="border-y border-white/[0.05] py-10 bg-surface" aria-label="Credenciais técnicas">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_ITEMS.map((t, i) => (
                <div key={t.text} className="flex flex-col items-center text-center gap-2.5">
                  <t.icon className="w-6 h-6 text-gold" strokeWidth={1.25} />
                  <span className="text-[0.78rem] text-muted-brand leading-snug">{t.text}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ═══ SISTEMAS — full-screen image panels, scroll-triggered (no sticky overlap) ═══ */}
        <section
          id="sistemas"
          aria-labelledby="sistemas-title"
        >
          {/* Section intro */}
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-24 pb-12">
            <Reveal className="max-w-[680px]">
              <span className="eyebrow mb-5">Sistemas &amp; Produtos</span>
              <h2
                id="sistemas-title"
                className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-tight mb-5"
              >
                Cada sistema, uma{' '}
                <span className="text-gold italic">decisão de engenharia</span>
              </h2>
              <p className="text-muted-brand text-[1rem] leading-relaxed max-w-[520px]">
                Role para conhecer os seis sistemas que executamos — todos com
                ART e garantia de 5 anos.
              </p>
            </Reveal>
          </div>

          {/* Full-screen image panels — each system is a full-viewport section */}
          {SISTEMAS.map((s) => (
            <div
              key={s.n}
              className="min-h-[85vh] flex items-end overflow-hidden relative"
            >
              {/* Full-bleed background image */}
              <div className="absolute inset-0 z-0" aria-hidden="true">
                <motion.img
                  src={s.img}
                  alt={`${s.title} — sistema de esquadrias executado pela Leal Glass`}
                  loading="lazy"
                  initial={{ scale: 1.12, opacity: 0.3 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
                  transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
              </div>

              {/* Text content overlay */}
              <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 w-full pb-14 lg:pb-20 pt-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                  transition={{ duration: 0.9, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="max-w-[540px]"
                >
                  <span className="font-mono-brand text-[0.72rem] text-gold tracking-[0.2em] mb-3 block">
                    {s.n} · {s.tag}
                  </span>
                  <h3 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.08] tracking-tight mb-4">
                    {s.title}
                  </h3>
                  <p className="text-[0.95rem] text-foreground/90 leading-relaxed mb-5 max-w-[420px]">
                    {s.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.bullets.map((b) => (
                      <span
                        key={b}
                        className="px-3 py-1.5 bg-gold-dim/60 border border-gold-border/40 rounded-full text-[0.72rem] text-gold-light backdrop-blur-sm"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </section>

        {/* ═══ PORTFÓLIO / OBRAS ═══ */}
        <section
          id="obras"
          className="py-24 lg:py-32 border-b border-white/[0.05]"
          aria-labelledby="obras-title"
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
              <div className="max-w-[640px]">
                <span className="eyebrow mb-5">Portfólio selecionado</span>
                <h2
                  id="obras-title"
                  className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-tight mb-4"
                >
                  Obras que <span className="text-gold italic">falam por nós</span>
                </h2>
                <p className="text-muted-brand text-[1rem] leading-relaxed max-w-[500px]">
                  Cada projeto executado integralmente por nossa equipe — do
                  levantamento dimensional à entrega final com laudo técnico.
                </p>
              </div>
              <a
                href="#orcamento"
                className="inline-flex items-center gap-2 text-[0.85rem] text-gold hover:text-gold-light transition-colors group"
              >
                Quero um projeto assim
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[260px]">
              {OBRAS.map((o, i) => (
                <Reveal
                  key={o.name}
                  delay={(i % 3) * 0.08}
                  className={`gallery-item group relative overflow-hidden rounded-lg cursor-pointer ${o.span}`}
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="absolute inset-0 w-full h-full text-left"
                    aria-label={`Ampliar imagem da obra ${o.name}`}
                  >
                    <img
                      src={o.img}
                      alt={`${o.name} — ${o.system} executada pela Leal Glass em ${o.city}`}
                      loading="lazy"
                      className="gallery-img w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="gallery-overlay mb-3">
                        <p className="text-[0.85rem] text-foreground/90 leading-relaxed mb-3">
                          {o.desc}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {o.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-full text-[0.65rem] text-muted-brand"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="font-display text-xl text-foreground tracking-tight mb-1">
                        {o.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-muted-brand">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {o.city}
                        </span>
                        <span>·</span>
                        <span>{o.area}</span>
                        <span>·</span>
                        <span className="text-gold">{o.system}</span>
                        <span>·</span>
                        <span>{o.year}</span>
                      </div>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DIFERENCIAIS — comparison table ═══ */}
        <section
          id="diferenciais"
          className="py-24 lg:py-32 border-b border-white/[0.05]"
          aria-labelledby="dif-title"
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <Reveal className="max-w-[680px] mx-auto text-center mb-14">
              <span className="eyebrow eyebrow-center mb-5">Por que a Leal Glass</span>
              <h2
                id="dif-title"
                className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-tight mb-4"
              >
                O que muda quando você para de{' '}
                <span className="text-gold italic">aceitar retrabalho</span>
              </h2>
              <p className="text-muted-brand text-[1rem] leading-relaxed">
                Comparativo direto entre o que o mercado entrega e o que
                garantimos em contrato.
              </p>
            </Reveal>

            <Reveal>
              {/* ═══ Mobile: card-based layout (no horizontal scroll) ═══ */}
              <div className="md:hidden space-y-3">
                {COMPARE_ROWS.map((r, i) => (
                  <div
                    key={r.criterion}
                    className={`rounded-lg overflow-hidden border ${i === 0 ? 'border-gold-border' : 'border-white/[0.06]'}`}
                  >
                    {/* Criterion header */}
                    <div className="px-4 py-3 bg-surface2 border-b border-white/[0.06]">
                      <p className="text-[0.82rem] font-medium text-foreground">
                        {r.criterion}
                      </p>
                    </div>
                    {/* Fabricante comum */}
                    <div className="px-4 py-3 flex items-start gap-2.5 border-b border-white/[0.04]">
                      <XIcon className="w-4 h-4 text-red-400/60 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <p className="text-[0.62rem] font-mono-brand uppercase tracking-[0.12em] text-muted2 mb-0.5">
                          Fabricante comum
                        </p>
                        <p className="text-[0.82rem] text-muted-brand leading-snug">
                          {r.common}
                        </p>
                      </div>
                    </div>
                    {/* Leal Glass — highlighted */}
                    <div className="px-4 py-3 flex items-start gap-2.5 bg-gold-dim/40">
                      <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                      <div>
                        <p className="text-[0.62rem] font-mono-brand uppercase tracking-[0.12em] text-gold mb-0.5">
                          Leal Glass
                        </p>
                        <p className="text-[0.82rem] text-foreground font-medium leading-snug">
                          {r.leal}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ═══ Desktop: traditional table ═══ */}
              <div className="hidden md:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <th className="py-4 px-5 text-[0.7rem] font-mono-brand uppercase tracking-[0.15em] text-muted2 font-normal">
                        Critério
                      </th>
                      <th className="py-4 px-5 text-[0.7rem] font-mono-brand uppercase tracking-[0.15em] text-muted2 font-normal text-center">
                        Fabricante comum
                      </th>
                      <th className="col-leal-top py-4 px-5 text-[0.7rem] font-mono-brand uppercase tracking-[0.15em] text-gold font-medium text-center">
                        Leal Glass
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((r, i) => {
                      const isLast = i === COMPARE_ROWS.length - 1;
                      return (
                        <tr key={r.criterion} className="border-t border-white/[0.05]">
                          <td className="py-4 px-5 text-[0.9rem] text-foreground/90">
                            {r.criterion}
                          </td>
                          <td className="py-4 px-5 text-[0.88rem] text-muted-brand text-center">
                            <span className="inline-flex items-center gap-2">
                              <XIcon className="w-4 h-4 text-red-400/60 flex-shrink-0" strokeWidth={2} />
                              {r.common}
                            </span>
                          </td>
                          <td
                            className={`col-leal-cell ${isLast ? 'col-leal-bot' : ''} py-4 px-5 text-[0.88rem] text-foreground text-center font-medium`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" strokeWidth={1.75} />
                              {r.leal}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ PROCESSO ═══ */}
        <section
          id="processo"
          className="py-24 lg:py-32 border-b border-white/[0.05]"
          aria-labelledby="proc-title"
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <Reveal className="max-w-[680px] mb-16">
              <span className="eyebrow mb-5">Nosso processo</span>
              <h2
                id="proc-title"
                className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-tight mb-4"
              >
                Do diagnóstico à entrega: seis etapas que{' '}
                <span className="text-gold italic">eliminam surpresas</span>{' '}
                na sua obra
              </h2>
              <p className="text-muted-brand text-[1rem] leading-relaxed max-w-[520px]">
                Cada etapa tem responsável definido, prazo contratual e
                critério de aceitação formal.
              </p>
            </Reveal>

            <ol className="relative">
              {/* vertical line */}
              <span
                className="absolute left-[23px] md:left-[31px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/40 to-gold/5"
                aria-hidden="true"
              />
              {PROCESSO.map((p, i) => (
                <Reveal key={p.n} delay={i * 0.05}>
                  <li className="relative flex gap-5 md:gap-7 pb-10 last:pb-0">
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border ${
                          i === 0
                            ? 'bg-gold text-background border-gold'
                            : 'bg-surface border-gold-border text-gold'
                        }`}
                      >
                        <p.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="pt-1 md:pt-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono-brand text-[0.7rem] text-muted2 tracking-widest">
                          {p.n}
                        </span>
                        <h3 className="font-display text-lg md:text-xl tracking-tight">
                          {p.title}
                        </h3>
                      </div>
                      <p className="text-[0.9rem] text-muted-brand leading-relaxed max-w-[560px]">
                        {p.desc}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ AUTORIDADE ═══ */}
        <section
          id="autoridade"
          className="py-24 lg:py-32 border-b border-white/[0.05]"
          aria-labelledby="aut-title"
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <Reveal className="max-w-[680px] mx-auto text-center mb-14">
              <span className="eyebrow eyebrow-center mb-5">Autoridade técnica</span>
              <h2
                id="aut-title"
                className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-tight mb-4"
              >
                As credenciais que toda licitação séria exige —{' '}
                <span className="text-gold italic">e nós já temos</span>
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {AUTORIDADE.map((a, i) => (
                <Reveal key={a.name} delay={(i % 4) * 0.07}>
                  <article className="card-top-line relative h-full p-7 bg-surface border border-white/[0.05] rounded-lg text-center hover:border-gold-border hover:-translate-y-1 transition-all duration-400">
                    <a.icon className="w-7 h-7 text-gold mx-auto mb-4" strokeWidth={1.25} />
                    <h3 className="font-display text-base mb-2 tracking-tight">
                      {a.name}
                    </h3>
                    <p className="text-[0.78rem] text-muted-brand leading-relaxed">
                      {a.desc}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DEPOIMENTOS ═══ */}
        <section
          id="depoimentos"
          className="py-24 lg:py-32 border-b border-white/[0.05]"
          aria-labelledby="dep-title"
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <Reveal className="max-w-[720px] mx-auto text-center mb-14">
              <span className="eyebrow eyebrow-center mb-5">Depoimentos</span>
              <h2
                id="dep-title"
                className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-tight mb-4"
              >
                O que diretores de construtora dizem{' '}
                <span className="text-gold italic">quando são sinceros</span>
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {DEPOIMENTOS.map((d, i) => (
                <Reveal key={d.name} delay={i * 0.1}>
                  <blockquote className="h-full flex flex-col p-7 bg-surface border border-white/[0.05] rounded-lg hover:border-gold-border transition-colors duration-400">
                    <Quote className="w-7 h-7 text-gold/40 mb-4" strokeWidth={1} />
                    <div className="flex gap-0.5 mb-4 text-gold" aria-label="5 estrelas">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-gold" strokeWidth={0} />
                      ))}
                    </div>
                    <p className="text-[0.92rem] leading-relaxed text-foreground/90 italic mb-5 flex-grow">
                      “{d.quote}”
                    </p>
                    <div className="mb-5 px-4 py-3 bg-gold-dim border border-gold-border rounded-md flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-gold flex-shrink-0" strokeWidth={1.75} />
                      <span className="text-[0.78rem] text-gold-light font-medium">
                        {d.result}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-light text-background flex items-center justify-center font-display text-sm font-medium flex-shrink-0">
                        {d.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.85rem] font-medium text-foreground truncate">
                          {d.name}
                        </p>
                        <p className="text-[0.72rem] text-muted-brand truncate">
                          {d.role} · {d.company}
                        </p>
                        <p className="text-[0.68rem] text-gold/80 truncate mt-0.5">
                          {d.obra}
                        </p>
                      </div>
                    </div>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ INTERMEDIATE CTA — capture convinced users before FAQ ═══ */}
        <section className="py-16 lg:py-20 border-b border-white/[0.05] bg-surface2/40">
          <div className="max-w-[960px] mx-auto px-6 lg:px-10">
            <Reveal className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
              <div className="max-w-[560px]">
                <h3 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-tight tracking-tight mb-2">
                  Convencido?{' '}
                  <span className="text-gold italic">Solicite o diagnóstico agora.</span>
                </h3>
                <p className="text-muted-brand text-[0.9rem]">
                  Engenheiro responde em 2h úteis. Sem compromisso, sem visita obrigatória.
                </p>
              </div>
              <a
                href="#orcamento"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-gold text-background text-[0.9rem] font-medium rounded-md btn-gold-glow whitespace-nowrap"
              >
                Solicitar diagnóstico técnico gratuito
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </a>
            </Reveal>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section
          id="faq"
          className="py-24 lg:py-32 border-b border-white/[0.05]"
          aria-labelledby="faq-title"
        >
          <div className="max-w-[820px] mx-auto px-6 lg:px-10">
            <Reveal className="text-center mb-14">
              <span className="eyebrow eyebrow-center mb-5">Perguntas frequentes</span>
              <h2
                id="faq-title"
                className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-tight mb-4"
              >
                Respostas diretas para{' '}
                <span className="text-gold italic">decisões técnicas</span>
              </h2>
            </Reveal>

            <Reveal>
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={`item-${i}`}
                    className="border-b border-white/[0.06]"
                  >
                    <AccordionTrigger className="py-6 text-left hover:no-underline group">
                      <span className="text-[0.98rem] font-medium text-foreground pr-4 group-hover:text-gold-light transition-colors">
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-[0.9rem] text-muted-brand leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* ═══ CTA / ORÇAMENTO ═══ */}
        <section
          id="orcamento"
          className="relative py-28 lg:py-36 overflow-hidden"
          aria-labelledby="cta-title"
        >
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <img
              src="/obras-curated/cta-bg-varanda-vidro.jpeg"
              alt=""
              loading="lazy"
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/92 to-background/75" />
          </div>

          <div className="relative z-10 max-w-[640px] mx-auto px-6 lg:px-10 text-center">
            <Reveal>
              <span className="eyebrow eyebrow-center mb-5">Diagnóstico técnico gratuito</span>
              <h2
                id="cta-title"
                className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1] tracking-tight mb-5"
              >
                Receba um diagnóstico técnico{' '}
                <span className="text-gold italic">gratuito</span> para o seu
                próximo empreendimento
              </h2>
              <p className="text-muted-brand text-[1rem] leading-relaxed mb-6 max-w-[560px] mx-auto">
                Preencha os 3 campos abaixo. Nosso engenheiro entra em contato
                em até <span className="text-foreground">2 horas úteis</span>.
                Sem compromisso, sem visita obrigatória.
              </p>

              {/* Lead magnet — what you receive */}
              <Reveal className="mb-8">
                <div className="grid sm:grid-cols-3 gap-3 max-w-[560px] mx-auto">
                  {[
                    { icon: Scan, text: 'Levantamento dimensional da obra' },
                    { icon: ClipboardCheck, text: 'Indicação do sistema adequado' },
                    { icon: Clock, text: 'Estimativa de custo em 48h' },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-start gap-2.5 p-3.5 bg-gold-dim/40 border border-gold-border/50 rounded-lg text-left"
                    >
                      <item.icon className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[0.78rem] text-foreground/90 leading-snug">{item.text}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="text-left bg-surface/80 backdrop-blur-md border border-white/[0.06] rounded-xl p-6 lg:p-8 space-y-4 max-w-[560px] mx-auto"
              >
                {/* Honeypot — hidden from humans, visible to bots */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] w-px h-px overflow-hidden opacity-0"
                  title="Não preencha este campo"
                />

                {/* Nome */}
                <div>
                  <label htmlFor="fName" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                    Nome *
                  </label>
                  <input
                    id="fName"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    placeholder="Seu nome"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'fName-err' : undefined}
                    className={`form-input w-full px-4 py-3.5 rounded-md text-[0.9rem] text-foreground ${errors.name ? 'border-red-400/60' : ''}`}
                  />
                  {errors.name && (
                    <p id="fName-err" className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                      <X className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="fPhone" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                    WhatsApp *
                  </label>
                  <input
                    id="fPhone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: formatPhone(e.target.value) });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="(41) 99999-9999"
                    inputMode="tel"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'fPhone-err' : undefined}
                    className={`form-input w-full px-4 py-3.5 rounded-md text-[0.9rem] text-foreground ${errors.phone ? 'border-red-400/60' : ''}`}
                  />
                  {errors.phone && (
                    <p id="fPhone-err" className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                      <X className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Tipo de projeto */}
                <div>
                  <label htmlFor="fProject" className="block text-[0.72rem] font-mono-brand uppercase tracking-[0.12em] text-muted-brand mb-2">
                    Tipo de projeto *
                  </label>
                  <Select
                    value={form.project || undefined}
                    onValueChange={(v) => {
                      setForm({ ...form, project: v });
                      if (errors.project) setErrors({ ...errors, project: '' });
                    }}
                  >
                    <SelectTrigger
                      id="fProject"
                      className={`form-input w-full h-[52px] px-4 rounded-md text-[0.9rem] text-foreground bg-surface2 justify-between data-[placeholder]:text-muted-foreground ${errors.project ? 'border-red-400/60' : ''}`}
                      aria-label="Tipo de projeto"
                      aria-invalid={!!errors.project}
                    >
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-white/[0.08] rounded-md">
                      <SelectItem value="fachada" className="text-[0.9rem] focus:bg-gold-dim focus:text-gold-light">Fachada / Structural Glazing</SelectItem>
                      <SelectItem value="esquadrias" className="text-[0.9rem] focus:bg-gold-dim focus:text-gold-light">Esquadrias residenciais</SelectItem>
                      <SelectItem value="condominio" className="text-[0.9rem] focus:bg-gold-dim focus:text-gold-light">Condomínio / Múltiplas unidades</SelectItem>
                      <SelectItem value="comercial" className="text-[0.9rem] focus:bg-gold-dim focus:text-gold-light">Edifício comercial</SelectItem>
                      <SelectItem value="industrial" className="text-[0.9rem] focus:bg-gold-dim focus:text-gold-light">Galpão / Industrial</SelectItem>
                      <SelectItem value="outro" className="text-[0.9rem] focus:bg-gold-dim focus:text-gold-light">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.project && (
                    <p className="mt-1.5 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                      <X className="w-3 h-3" /> {errors.project}
                    </p>
                  )}
                </div>

                {/* LGPD consent checkbox — obrigatório */}
                <label
                  htmlFor="fConsent"
                  className={`flex items-start gap-3 cursor-pointer p-3 rounded-md border transition-colors ${
                    errors.consent ? 'border-red-400/60 bg-red-400/5' : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <input
                    id="fConsent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (errors.consent) setErrors({ ...errors, consent: '' });
                    }}
                    className="mt-0.5 w-4 h-4 accent-gold flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-[0.75rem] text-muted-brand leading-relaxed">
                    Li e concordo com a{' '}
                    <a href="/politica-de-privacidade" className="text-gold hover:text-gold-light underline underline-offset-2">
                      Política de Privacidade
                    </a>{' '}
                    e autorizo o contato comercial conforme a{' '}
                    <span className="text-foreground/80">Lei 13.709/2018 (LGPD)</span>.
                  </span>
                </label>
                {errors.consent && (
                  <p className="-mt-2 text-[0.75rem] text-red-400 flex items-center gap-1.5">
                    <X className="w-3 h-3" /> {errors.consent}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 h-auto bg-gold text-background hover:bg-gold-light text-[0.9rem] font-medium tracking-wide btn-gold-glow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      Solicitar diagnóstico técnico gratuito
                      <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                    </>
                  )}
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-[0.72rem] text-muted-brand">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                    Sem compromisso
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                    Resposta em 2h úteis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                    Dados protegidos
                  </span>
                </div>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-auto border-t border-white/[0.06] bg-surface">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] mb-12">
            <div>
              <a href="#hero" className="flex items-center gap-3 mb-4" aria-label="Leal Glass">
                <img
                  src="/logo-navbar.png"
                  alt="Logotipo Leal Glass"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <span className="font-display text-xl">
                  Leal <span className="text-gold italic">Glass</span>
                </span>
              </a>
              <p className="text-[0.85rem] text-muted-brand leading-relaxed max-w-[300px]">
                Fachadas e esquadrias de alumínio de alto padrão para
                construtoras, incorporadoras e escritórios de arquitetura em
                Curitiba e todo o Brasil.
              </p>
              <div className="flex gap-3 mt-5">
                <a
                  href="https://instagram.com/lealglass"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da Leal Glass"
                  className="w-9 h-9 flex items-center justify-center border border-white/[0.08] rounded-md text-muted-brand hover:text-gold hover:border-gold-border transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/lealglass"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn da Leal Glass"
                  className="w-9 h-9 flex items-center justify-center border border-white/[0.08] rounded-md text-muted-brand hover:text-gold hover:border-gold-border transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube da Leal Glass"
                  className="w-9 h-9 flex items-center justify-center border border-white/[0.08] rounded-md text-muted-brand hover:text-gold hover:border-gold-border transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-[0.68rem] font-mono-brand uppercase tracking-[0.18em] text-muted2 mb-4">
                Empresa
              </h4>
              <ul className="space-y-2.5">
                <li><a href="#sistemas" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors">Sistemas</a></li>
                <li><a href="#obras" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors">Obras</a></li>
                <li><a href="#processo" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors">Processo</a></li>
                <li><a href="#diferenciais" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors">Diferenciais</a></li>
                <li><a href="#autoridade" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors">Autoridade técnica</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[0.68rem] font-mono-brand uppercase tracking-[0.18em] text-muted2 mb-4">
                Contato
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="https://wa.me/5541998512093" target="_blank" rel="noopener noreferrer" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-gold" /> (41) 99851-2093
                  </a>
                </li>
                <li>
                  <a href="tel:+554130570873" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gold" /> (41) 3057-0873
                  </a>
                </li>
                <li>
                  <a href="mailto:sistemas@lealglass.com.br" className="text-[0.85rem] text-muted-brand hover:text-foreground transition-colors flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gold" /> sistemas@lealglass.com.br
                  </a>
                </li>
                <li className="text-[0.85rem] text-muted-brand flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  <span>R. Antonio Ribeiro Macedo, 295<br />Xaxim, Curitiba — PR<br />CEP 81.810-250</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[0.68rem] font-mono-brand uppercase tracking-[0.18em] text-muted2 mb-4">
                Certificações
              </h4>
              <ul className="space-y-2.5">
                <li className="text-[0.85rem] text-muted-brand flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-gold" /> NBR 10821
                </li>
                <li className="text-[0.85rem] text-muted-brand flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-gold" /> NBR 15575
                </li>
                <li className="text-[0.85rem] text-muted-brand flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-gold" /> NBR 15928
                </li>
                <li className="text-[0.85rem] text-muted-brand flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-gold" /> ART / CREA-PR
                </li>
              </ul>
            </div>
          </div>

          <div className="hairline mb-7" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-[0.78rem] text-muted2">
              © 2025 Leal Glass Esquadrias Ltda · CNPJ 30.624.485/0001-55 · Todos os direitos reservados
            </p>
            <p className="text-[0.72rem] text-muted2">
              R. Antonio Ribeiro Macedo, 295 · Xaxim, Curitiba/PR · CEP 81.810-250 ·{' '}
              <a href="/politica-de-privacidade" className="hover:text-gold transition-colors underline underline-offset-2">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ═══ WHATSAPP FLOAT ═══ */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="wa-ring fixed bottom-6 right-6 z-40 flex items-center gap-2.5 pl-4 pr-5 py-3.5 bg-[#25d366] text-white rounded-full shadow-[0_8px_30px_-6px_rgba(37,211,102,0.5)] hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline text-[0.85rem] font-medium">
          Falar agora
        </span>
      </a>

      {/* ═══ SCROLL TO TOP ═══ */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 left-6 z-40 w-11 h-11 flex items-center justify-center bg-surface2 border border-white/[0.1] rounded-full text-muted-brand hover:text-gold hover:border-gold-border transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══ LGPD BANNER — appears immediately on first visit ═══ */}
      <AnimatePresence>
        {lgpdVisible && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-0 left-0 right-0 z-[80] bg-surface2 border-t border-gold-border shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
            role="dialog"
            aria-label="Consentimento de cookies (LGPD)"
          >
            <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[0.82rem] text-muted-brand leading-relaxed max-w-[760px] text-center md:text-left">
                Utilizamos cookies e tecnologias semelhantes para melhorar sua
                experiência e analisar tráfego. Ao continuar, você concorda com
                nossa{' '}
                <a href="/politica-de-privacidade" className="text-gold hover:text-gold-light underline underline-offset-2">
                  Política de Privacidade
                </a>
                , conforme a{' '}
                <span className="text-gold-light">Lei 13.709/2018 (LGPD)</span>.
              </p>
              <div className="flex gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleLgpd('rejected')}
                  className="px-4 py-2.5 text-[0.78rem] text-muted-brand border border-white/[0.1] rounded-md hover:text-foreground hover:border-white/30 transition-colors"
                >
                  Recusar
                </button>
                <button
                  type="button"
                  onClick={() => handleLgpd('accepted')}
                  className="px-5 py-2.5 text-[0.78rem] font-medium bg-gold text-background rounded-md hover:bg-gold-light transition-colors"
                >
                  Aceitar todos
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LIGHTBOX ═══ */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out"
            role="dialog"
            aria-label={`Imagem ampliada: ${OBRAS[lightbox].name}`}
            aria-modal="true"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Fechar"
              className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center bg-surface2 border border-white/[0.1] rounded-full text-foreground hover:text-gold hover:border-gold-border transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((p) => (p === null ? p : (p - 1 + OBRAS.length) % OBRAS.length));
              }}
              aria-label="Obra anterior"
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-surface2/80 backdrop-blur border border-white/[0.1] rounded-full text-foreground hover:text-gold hover:border-gold-border transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((p) => (p === null ? p : (p + 1) % OBRAS.length));
              }}
              aria-label="Próxima obra"
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-surface2/80 backdrop-blur border border-white/[0.1] rounded-full text-foreground hover:text-gold hover:border-gold-border transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[0.72rem] font-mono-brand tracking-widest text-muted-brand z-10">
              {lightbox + 1} / {OBRAS.length}
            </div>

            <motion.div
              key={lightbox}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[1100px] w-full"
            >
              <img
                src={OBRAS[lightbox].img}
                alt={`${OBRAS[lightbox].name} — ${OBRAS[lightbox].system} em ${OBRAS[lightbox].city}`}
                className="w-full max-h-[68vh] object-contain rounded-lg"
              />
              <div className="mt-6 text-center">
                <h3 className="font-display text-2xl mb-2 tracking-tight">
                  {OBRAS[lightbox].name}
                </h3>
                <p className="text-muted-brand text-[0.92rem] max-w-[600px] mx-auto leading-relaxed mb-3">
                  {OBRAS[lightbox].desc}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.78rem] text-muted-brand">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {OBRAS[lightbox].city}</span>
                  <span>·</span><span>{OBRAS[lightbox].area}</span>
                  <span>·</span><span className="text-gold">{OBRAS[lightbox].system}</span>
                  <span>·</span><span>{OBRAS[lightbox].year}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COUNT UP — animated counter for sticky scroll metrics
   ════════════════════════════════════════════════════════════ */
function CountUp({ target, inView }: { target: number; inView: boolean }) {
  const value = useCountUp(target, inView);
  return <>{value}</>;
}
