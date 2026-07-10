import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade da Leal Glass Esquadrias Ltda — tratamento de dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).",
  alternates: { canonical: "https://www.lealglass.com.br/politica-de-privacidade" },
  openGraph: {
    title: "Política de Privacidade · Leal Glass",
    description:
      "Como tratamos seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018).",
  },
};

export default function PoliticaPrivacidadePage() {
  const lastUpdate = "Julho de 2025";

  return (
    <main className="min-h-[100svh] bg-background text-foreground">
      {/* Hero da página */}
      <header className="border-b border-white/[0.06] pt-32 pb-12">
        <div className="max-w-[820px] mx-auto px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[0.78rem] text-muted-brand hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
          <span className="eyebrow mb-4">Documento legal</span>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-tight mb-3">
            Política de <span className="text-gold italic">Privacidade</span>
          </h1>
          <p className="text-muted-brand text-[0.92rem]">
            Última atualização: {lastUpdate}
          </p>
        </div>
      </header>

      {/* Conteúdo */}
      <article className="py-16">
        <div className="max-w-[820px] mx-auto px-6 lg:px-10 space-y-10 text-[0.92rem] leading-relaxed text-muted-brand">
          <Section title="1. Introdução">
            A <strong className="text-foreground">Leal Glass Esquadrias Ltda</strong>,
            inscrita no CNPJ sob o nº <strong className="text-foreground">30.624.485/0001-55</strong>,
            com sede na Rua Antonio Ribeiro Macedo, 295 — Xaxim, Curitiba — PR,
            CEP 81.810-250 ("Leal Glass", "nós" ou "nossa"), respeita a privacidade
            dos visitantes e usuários deste site e está comprometida em proteger
            seus dados pessoais em conformidade com a{' '}
            <strong className="text-foreground">Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD)</strong>{' '}
            e demais legislações aplicáveis.
          </Section>

          <Section title="2. Dados pessoais que coletamos">
            <p className="mb-3">Coletamos apenas os dados necessários para responder às suas solicitações e prestar nossos serviços:</p>
            <ul className="space-y-2 ml-1">
              <li>• <strong className="text-foreground">Nome completo</strong> — para identificação e atendimento personalizado.</li>
              <li>• <strong className="text-foreground">WhatsApp / telefone</strong> — para contato comercial e suporte.</li>
              <li>• <strong className="text-foreground">E-mail</strong> — quando fornecido, para envio de propostas e documentos.</li>
              <li>• <strong className="text-foreground">Tipo de projeto</strong> — para direcionar o atendimento técnico adequado.</li>
              <li>• <strong className="text-foreground">Mensagem</strong> — informações complementares que você optar por compartilhar.</li>
              <li>• <strong className="text-foreground">Dados de navegação</strong> — endereço IP, tipo de navegador, páginas visitadas (via cookies, mediante consentimento).</li>
            </ul>
          </Section>

          <Section title="3. Finalidades do tratamento">
            <p className="mb-3">Seus dados pessoais são utilizados exclusivamente para:</p>
            <ul className="space-y-2 ml-1">
              <li>• Responder solicitações de orçamento e diagnóstico técnico.</li>
              <li>• Entrar em contato comercial sobre projetos de esquadrias e fachadas.</li>
              <li>• Cumprir obrigações contratuais, fiscais e legais.</li>
              <li>• Melhorar a experiência de navegação e o conteúdo do site.</li>
              <li>• Enviar comunicações comerciais (apenas mediante consentimento expresso).</li>
            </ul>
          </Section>

          <Section title="4. Base legal">
            <p className="mb-3">O tratamento dos seus dados pessoais é fundamentado nas seguintes bases legais previstas na LGPD:</p>
            <ul className="space-y-2 ml-1">
              <li>• <strong className="text-foreground">Art. 7º, I</strong> — consentimento (formulário de orçamento).</li>
              <li>• <strong className="text-foreground">Art. 7º, V</strong> — execução de contrato (propostas e contratos comerciais).</li>
              <li>• <strong className="text-foreground">Art. 7º, II</strong> — cumprimento de obrigação legal (dados fiscais).</li>
              <li>• <strong className="text-foreground">Art. 7º, IX</strong> — legítimo interesse (melhoria do site e atendimento).</li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento de dados">
            <p>
              A Leal Glass <strong className="text-foreground">não vende, aluga nem comercializa</strong> seus
              dados pessoais. Podemos compartilhá-los apenas com:
            </p>
            <ul className="space-y-2 ml-1 mt-3">
              <li>• Prestadores de serviço essenciais (hospedagem, banco de dados, e-mail) — sob contratos com cláusulas de confidencialidade.</li>
              <li>• Autoridades públicas, quando exigido por lei ou ordem judicial.</li>
              <li>• Empresas do mesmo grupo econômico, exclusivamente para fins de atendimento interno.</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p className="mb-3">
              Utilizamos cookies essenciais para o funcionamento do site e cookies
              opcionais para análise de tráfego. Você pode aceitar ou recusar os
              cookies opcionais a qualquer momento pelo banner exibido na primeira
              visita.
            </p>
            <ul className="space-y-2 ml-1">
              <li>• <strong className="text-foreground">Essenciais</strong>: necessários para navegação e segurança. Não requerem consentimento.</li>
              <li>• <strong className="text-foreground">Analíticos</strong>: Google Analytics, para entender o uso do site. Requerem consentimento.</li>
              <li>• <strong className="text-foreground">Marketing</strong>: para remarketing. Requerem consentimento (quando ativados).</li>
            </ul>
            <p className="mt-3">
              Você pode gerenciar cookies pelo seu navegador. Desativar todos os
              cookies pode afetar a funcionalidade do site.
            </p>
          </Section>

          <Section title="7. Seus direitos como titular de dados">
            <p className="mb-3">Conforme o Art. 18 da LGPD, você tem direito a:</p>
            <ul className="space-y-2 ml-1">
              <li>• Confirmar a existência de tratamento dos seus dados.</li>
              <li>• Acessar os seus dados pessoais.</li>
              <li>• Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>• Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>• Solicitar a portabilidade dos dados a outro fornecedor.</li>
              <li>• Revogar o consentimento a qualquer momento.</li>
              <li>• Obter informações sobre o compartilhamento de seus dados.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, envie um e-mail para{' '}
              <a href="mailto:sistemas@lealglass.com.br" className="text-gold hover:text-gold-light underline underline-offset-2">
                sistemas@lealglass.com.br
              </a>{' '}
              com o assunto "Exercício de Direitos — LGPD".
            </p>
          </Section>

          <Section title="8. Segurança dos dados">
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados
              contra acessos não autorizados, perda, alteração ou divulgação
              indevida. Isso inclui: criptografia em trânsito (TLS/SSL), acesso
              restrito por credenciais, monitoramento contínuo e backups
              automáticos. Nenhum método de transmissão pela internet é 100%
              seguro, mas nos esforçamos para proteger suas informações.
            </p>
          </Section>

          <Section title="9. Retenção de dados">
            <p>
              Mantemos seus dados pessoais pelo tempo necessário para cumprir as
              finalidades descritas nesta política, salvo quando a retenção for
              exigida por lei (dados fiscais: 5 anos; contratos: 5 anos após o
              término). Após esse período, os dados são anonimizados ou excluídos
              de forma segura.
            </p>
          </Section>

          <Section title="10. Transferência internacional de dados">
            <p>
              Alguns dos nossos prestadores de serviço (ex: hospedagem em nuvem,
              analytics) podem processar dados fora do Brasil. Em todos os casos,
              garantimos que a transferência ocorre em conformidade com o Art. 33
              da LGPD, com países que ofereçam nível adequado de proteção ou sob
              cláusulas contratuais padrão.
            </p>
          </Section>

          <Section title="11. Encarregado de Dados (DPO)">
            <p className="mb-3">
              Para dúvidas, solicitações ou reclamações relacionadas aos seus dados
              pessoais, entre em contato com nosso encarregado de tratamento de
              dados:
            </p>
            <div className="bg-surface border border-white/[0.06] rounded-lg p-5 space-y-3">
              <p className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <a href="mailto:sistemas@lealglass.com.br" className="text-foreground hover:text-gold transition-colors">
                  sistemas@lealglass.com.br
                </a>
              </p>
              <p className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <a href="tel:+554130570873" className="text-foreground hover:text-gold transition-colors">
                  (41) 3057-0873
                </a>
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-foreground">
                  Rua Antonio Ribeiro Macedo, 295 — Xaxim<br />
                  Curitiba — PR · CEP 81.810-250
                </span>
              </p>
            </div>
          </Section>

          <Section title="12. Alterações nesta política">
            <p>
              Esta Política de Privacidade pode ser atualizada periodicamente para
              refletir mudanças em nossas práticas ou na legislação. A data de
              "última atualização" no topo desta página indica a versão vigente.
              Recomendamos que você revise esta página regularmente.
            </p>
          </Section>

          <Section title="13. Autoridade fiscalizadora">
            <p>
              Se entender que seus direitos foram violados, você pode apresentar
              reclamação à{' '}
              <a
                href="https://www.gov.br/anpd/pt-br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline underline-offset-2"
              >
                Autoridade Nacional de Proteção de Dados (ANPD)
              </a>
              {' '}— órgão responsável por fiscalizar a LGPD no Brasil.
            </p>
          </Section>

          {/* Aviso de proteção */}
          <div className="bg-gold-dim/30 border border-gold-border/50 rounded-lg p-5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <p className="text-[0.85rem] text-foreground/90 leading-relaxed">
              <strong className="text-gold">Compromisso da Leal Glass:</strong>{' '}
              tratamos seus dados com a mesma seriedade com que tratamos nossos
              projetos de engenharia — com precisão, transparência e responsabilidade
              técnica.
            </p>
          </div>
        </div>
      </article>

      {/* Footer simples */}
      <footer className="border-t border-white/[0.06] py-10 mt-10">
        <div className="max-w-[820px] mx-auto px-6 lg:px-10 text-center">
          <p className="text-[0.78rem] text-muted2 mb-2">
            © 2025 Leal Glass Esquadrias Ltda · CNPJ 30.624.485/0001-55
          </p>
          <Link
            href="/"
            className="text-[0.82rem] text-gold hover:text-gold-light underline underline-offset-2"
          >
            Voltar ao início
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-foreground tracking-tight mb-4 mt-0">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
