import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

/* ════════════════════════════════════════════════════════════
   FONTS — preloaded, display: swap, narrow weight set
   Cormorant Garamond = editorial display (titles)
   DM Sans = neutral UI sans
   DM Mono = technical eyebrow / mono labels
   ════════════════════════════════════════════════════════════ */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL = "https://www.lealglass.com.br";
const HERO_IMG = `${SITE_URL}/obras-curated/og-casa-cubo-vidro.jpeg`;

/* ════════════════════════════════════════════════════════════
   METADATA — complete SEO, Open Graph, Twitter, robots
   ════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Leal Glass | Fachadas & Esquadrias de Alumínio de Alto Padrão em Curitiba",
    template: "%s · Leal Glass",
  },
  description:
    "Fachadas e esquadrias de alumínio de alto padrão em Curitiba. Structural Glazing, Linha Perfecta Plus 3.5 e guarda-corpos para construtoras, incorporadoras e arquitetos. 500+ obras entregues no prazo. ART inclusa. Proposta técnica em 24h.",
  keywords: [
    "esquadrias de alumínio Curitiba",
    "fachada alumínio Curitiba",
    "structural glazing Curitiba",
    "fachada estrutural",
    "guarda corpo de vidro",
    "esquadrias alto padrão",
    "esquadrias para construtoras",
    "esquadrias para incorporadoras",
    "Leal Glass",
    "linha perfecta plus",
    "fachada ventilada",
    "curtain wall",
    "vidro estrutural",
    "ART esquadrias",
    "NBR 10821",
  ],
  authors: [{ name: "Leal Glass", url: SITE_URL }],
  creator: "Leal Glass",
  publisher: "Leal Glass",
  applicationName: "Leal Glass",
  category: "Construção Civil",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Leal Glass",
    title: "Leal Glass | Fachadas & Esquadrias de Alumínio de Alto Padrão",
    description:
      "500+ obras entregues no prazo. Structural Glazing, fachadas e esquadrias premium para construtoras e arquitetos em Curitiba — PR. Proposta técnica em 24h. ART inclusa.",
    images: [
      {
        url: HERO_IMG,
        width: 1200,
        height: 630,
        alt: "Fachada em Structural Glazing executada pela Leal Glass — Curitiba PR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leal Glass | Fachadas & Esquadrias de Alumínio",
    description:
      "500+ obras. Structural Glazing, fachadas e esquadrias premium. Curitiba — PR. Proposta técnica em 24h.",
    images: [HERO_IMG],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/logo-retina.png", type: "image/png", sizes: "256x256" },
    ],
    apple: "/logo-retina.png",
  },
  other: {
    "theme-color": "#07080C",
    "format-detection": "telephone=no",
  },
};

/* ════════════════════════════════════════════════════════════
   SCHEMA.ORG — Organization · LocalBusiness · FAQPage ·
   BreadcrumbList · Product+Review (E-E-A-T)
   ════════════════════════════════════════════════════════════ */
function JsonLd() {
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": ["Organization", "LocalBusiness", "HomeAndConstructionBusiness"],
      "@id": `${SITE_URL}#organization`,
      name: "Leal Glass Esquadrias",
      legalName: "Leal Glass Esquadrias Ltda",
      taxID: "30.624.485/0001-55",
      description:
        "Fábrica de fachadas e esquadrias de alumínio de alto padrão em Curitiba — PR. Projeto, fabricação e instalação com ART e garantia de 5 anos.",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-retina.png`,
      image: HERO_IMG,
      telephone: "+554130570873",
      email: "sistemas@lealglass.com.br",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Antonio Ribeiro Macedo, 295, Xaxim",
        addressLocality: "Curitiba",
        addressRegion: "PR",
        postalCode: "81810-250",
        addressCountry: "BR",
      },
      geo: { "@type": "GeoCoordinates", latitude: -25.5088, longitude: -49.2991 },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
      ],
      priceRange: "$$$",
      areaServed: { "@type": "Country", name: "Brasil" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "127",
        bestRating: "5",
        worstRating: "1",
      },
      sameAs: [
        "https://instagram.com/lealglass",
        "https://linkedin.com/company/lealglass",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Fachadas e Esquadrias de Alumínio de Alto Padrão",
      description:
        "Structural Glazing, fachadas ventiladas, esquadrias linha perfecta plus e guarda-corpos. Projeto, fabricação e instalação com ART e garantia de 5 anos.",
      brand: { "@type": "Brand", name: "Leal Glass" },
      image: HERO_IMG,
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "35000",
        availability: "https://schema.org/InStock",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "BRL",
          minPrice: "35000",
        },
      },
      review: [
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Ricardo Mendes" },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "Entregaram 2.400 m² de esquadrias no prazo exato de 65 dias. Zero retrabalho.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Camila Ferreira" },
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "A precisão milimétrica dos vãos nos poupou três semanas de adaptação.",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "127",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Qual o prazo médio de entrega de um projeto de fachada?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Projetos de fachada completa variam de 45 a 90 dias corridos após aprovação do projeto executivo, formalizado em contrato com cláusula de multa por atraso.",
          },
        },
        {
          "@type": "Question",
          name: "A Leal Glass emite ART de projeto e execução?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. A ART (Anotação de Responsabilidade Técnica) de projeto e execução está inclusa em todos os contratos, assinada por engenheiro do nosso quadro e registrada no CREA-PR, sem custo adicional.",
          },
        },
        {
          "@type": "Question",
          name: "Qual a garantia oferecida pela Leal Glass?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "5 anos de garantia em estrutura e vedação. Visita de manutenção preventiva no 12º mês incluída no contrato. Ferragens e componentes mecânicos com 5 anos.",
          },
        },
        {
          "@type": "Question",
          name: "Quais normas ABNT as esquadrias atendem?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NBR 10821 (esquadrias externas), NBR 15575 (desempenho habitacional), NBR 15928 (esquadrias de alumínio) e NBR 7198 quando aplicável.",
          },
        },
        {
          "@type": "Question",
          name: "Vocês atendem fora de Curitiba?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. Atendemos todo o território nacional com equipes próprias. Para projetos acima de 500 m² a viagem técnica não tem custo adicional.",
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Obras", item: `${SITE_URL}/#obras` },
        { "@type": "ListItem", position: 3, name: "Contato", item: `${SITE_URL}/#contato` },
      ],
    },
  ];

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07080C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        {/* Preload hero image (LCP element) — highest priority */}
        <link
          rel="preload"
          as="image"
          href="/obras-curated/hero-casa-vidro.jpeg"
          fetchPriority="high"
        />
        <JsonLd />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
