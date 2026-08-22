import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarDays,
  Contact,
  Factory,
  MailPlus,
  Radar,
  Sheet,
} from "lucide-react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Página Inicial — Leads Platform" },
      {
        name: "description",
        content:
          "Painel inicial com atalhos para pesquisa de leads e CRM: empresas, sócios, exportações, e-mail e agenda.",
      },
      { property: "og:title", content: "Página Inicial — Leads Platform" },
      {
        property: "og:description",
        content:
          "Painel inicial com atalhos para pesquisa de leads e CRM: empresas, sócios, exportações, e-mail e agenda.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <PaginaInicial />
    </RotaProtegida>
  ),
});

const METRICAS = [
  { rotulo: "Total de empresas", valor: "72.789.638", variacao: "+289.724" },
  { rotulo: "Empresas ativas", valor: "28.148.920", variacao: "-1,47%" },
  { rotulo: "Sócios", valor: "28.146.721", variacao: "+0,49%" },
  { rotulo: "Dívidas federais", valor: "49.702.198", variacao: "+5,45%" },
];

const ATALHOS_BUSCA = [
  {
    to: "/empresas",
    titulo: "Pesquisa de Empresas",
    descricao: "Filtre por UF, CNAE, porte e capital social",
    icon: Factory,
  },
  {
    to: "/socios",
    titulo: "Pesquisa por Sócios",
    descricao: "Nome ou CPF parcial, vinculado às empresas",
    icon: Contact,
  },
  {
    to: "/exportacoes",
    titulo: "Minhas Exportações",
    descricao: "Histórico de arquivos CSV gerados",
    icon: Sheet,
  },
];

const ATALHOS_CRM = [
  {
    to: "/minhas-empresas",
    titulo: "Minhas Empresas",
    descricao: "Carteira de empresas salvas e etiquetadas",
    icon: Briefcase,
  },
  {
    to: "/email",
    titulo: "Envio de E-mail",
    descricao: "Componha mensagens e acompanhe envios",
    icon: MailPlus,
  },
  {
    to: "/agenda",
    titulo: "Agenda/Anotações",
    descricao: "Tarefas e notas vinculadas a leads",
    icon: CalendarDays,
  },
];

function Atalhos({
  titulo,
  itens,
}: {
  titulo: string;
  itens: typeof ATALHOS_BUSCA;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-inkMuted">
        {titulo}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-md border border-edge bg-surface p-4 transition-colors hover:border-accent/60"
          >
            <div className="flex items-start justify-between gap-3">
              <item.icon className="h-5 w-5 text-accent" />
              <ArrowUpRight className="h-4 w-4 text-inkMuted transition-transform group-hover:-translate-y-0.5 group-hover:text-accent" />
            </div>
            <div className="mt-3 text-sm font-semibold text-ink">{item.titulo}</div>
            <p className="mt-1 text-xs text-inkMuted">{item.descricao}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PaginaInicial() {
  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Página Inicial"
        descricao="Base atualizada — dados públicos da Receita Federal"
        extra={
          <Link
            to="/empresas"
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent/90"
          >
            Nova pesquisa
          </Link>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {METRICAS.map((m) => (
            <div
              key={m.rotulo}
              className="rounded-md border border-edge bg-surface px-4 py-3"
            >
              <div className="font-mono text-xs uppercase tracking-wide text-inkMuted">
                {m.rotulo}
              </div>
              <div className="mt-1 font-mono text-lg font-semibold text-ink">
                {m.valor}
              </div>
              <div className="font-mono text-xs text-accent">{m.variacao}</div>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-md border border-edge bg-surface p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-inkMuted">
            Minha última pesquisa
          </h2>
          <dl className="mt-3 grid gap-3 font-mono text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-inkMuted">Data</dt>
              <dd className="text-ink">19/08/2026 13:24</dd>
            </div>
            <div>
              <dt className="text-xs text-inkMuted">Estado</dt>
              <dd className="text-ink">CE</dd>
            </div>
            <div>
              <dt className="text-xs text-inkMuted">Resultado</dt>
              <dd className="text-accent">751.190 empresas</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/empresas"
              className="rounded border border-edge px-3 py-1.5 text-xs text-ink hover:bg-surface2"
            >
              Refazer pesquisa
            </Link>
            <Link
              to="/exportacoes"
              className="rounded border border-edge px-3 py-1.5 text-xs text-ink hover:bg-surface2"
            >
              Ver exportações
            </Link>
          </div>
        </section>

        <Atalhos titulo="Busca de leads" itens={ATALHOS_BUSCA} />
        <Atalhos titulo="CRM" itens={ATALHOS_CRM} />

        <div className="flex items-center gap-2 rounded-md border border-edge bg-surface px-4 py-3 text-xs text-inkMuted">
          <Building2 className="h-4 w-4 text-accent" />
          Dados do Cadastro Nacional de CNPJ atualizados mensalmente.
        </div>
      </div>
    </main>
  );
}
