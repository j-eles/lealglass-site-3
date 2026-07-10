import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Phone, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Solicitação recebida · Obrigado",
  description:
    "Recebemos sua solicitação de diagnóstico técnico. Nosso engenheiro entrará em contato em até 2 horas úteis.",
  robots: { index: false, follow: false },
};

const WHATSAPP_NUMBER = "5541998512093";
const WHATSAPP_MSG =
  "Olá! Acabei de enviar uma solicitação de diagnóstico pelo site e gostaria de adiantar o atendimento.";

export default function ObrigadoPage() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center px-6 py-20 bg-background">
      <div className="max-w-[560px] w-full text-center">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-dim border border-gold-border mb-8">
          <CheckCircle2 className="w-10 h-10 text-gold" strokeWidth={1.25} />
        </div>

        <span className="eyebrow eyebrow-center mb-5">Solicitação recebida</span>

        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-tight mb-5">
          Obrigado. Seu diagnóstico técnico{' '}
          <span className="text-gold italic">está a caminho.</span>
        </h1>

        <p className="text-muted-brand text-[1rem] leading-relaxed mb-10">
          Recebemos sua solicitação. Nosso engenheiro responsável entrará em
          contato pelo WhatsApp em até{' '}
          <span className="text-foreground">2 horas úteis</span> com a proposta
          de diagnóstico técnico gratuito para o seu empreendimento.
        </p>

        {/* What happens next */}
        <div className="text-left bg-surface border border-white/[0.06] rounded-xl p-6 lg:p-8 mb-8 space-y-5">
          <h2 className="text-[0.72rem] font-mono-brand uppercase tracking-[0.18em] text-gold mb-4">
            Próximos passos
          </h2>
          {[
            {
              icon: Phone,
              title: 'Contato em 2 horas úteis',
              desc: 'Nosso engenheiro liga ou chama no WhatsApp para entender o escopo do seu projeto.',
            },
            {
              icon: Clock,
              title: 'Diagnóstico em até 48h',
              desc: 'Agendamos a visita técnica (com scanner 3D quando aplicável) e emitimos o relatório.',
            },
            {
              icon: CheckCircle2,
              title: 'Proposta técnica detalhada',
              desc: 'Você recebe a indicação de sistema, prazo e estimativa de investimento — sem compromisso.',
            },
          ].map((step, i) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gold-dim border border-gold-border flex items-center justify-center">
                <step.icon className="w-4 h-4 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[0.92rem] font-medium text-foreground mb-0.5">
                  {i + 1}. {step.title}
                </p>
                <p className="text-[0.82rem] text-muted-brand leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25d366] text-white text-[0.88rem] font-medium rounded-md hover:brightness-110 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Adiantar pelo WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 border border-white/12 text-[0.88rem] text-foreground rounded-md hover:border-white/30 hover:bg-white/[0.03] transition"
          >
            Voltar ao início
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-[0.72rem] text-muted-foreground mt-8">
          Dúvidas? Ligue{' '}
          <a href="tel:+554130570873" className="text-gold hover:text-gold-light">
            (41) 3057-0873
          </a>{' '}
          · atendimento de seg. a sex., 8h às 18h.
        </p>
      </div>
    </main>
  );
}
