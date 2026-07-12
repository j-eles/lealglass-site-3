import type { Metadata } from "next";
import ContatoClient from "./contato-client";

export const metadata: Metadata = {
  title: "Contato · Leal Glass",
  description:
    "Fale com a Leal Glass — telefone, WhatsApp, email e endereço em Curitiba. Envie documentos, desenhos e projetos. Atendemos construtoras, escritórios e proprietários em todo o Brasil.",
  alternates: { canonical: "https://www.lealglass.com.br/contato" },
  openGraph: {
    title: "Contato · Leal Glass",
    description:
      "Fale com a Leal Glass — telefone, WhatsApp, email e endereço. Envie documentos e desenhos.",
    url: "https://www.lealglass.com.br/contato",
  },
};

export default function ContatoPage() {
  return <ContatoClient />;
}
