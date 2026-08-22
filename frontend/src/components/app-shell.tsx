import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  CalendarDays,
  Contact,
  Factory,
  LogOut,
  MailPlus,
  Menu,
  Radar,
  Sheet,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { sair } from "@/auth";
import { useAuth } from "@/hooks/use-auth";

type Item = {
  to: string;
  label: string;
  icon: typeof Radar;
};

type Grupo = {
  titulo: string | null;
  itens: Item[];
};

const GRUPOS: Grupo[] = [
  {
    titulo: null,
    itens: [{ to: "/", label: "Página Inicial", icon: Radar }],
  },
  {
    titulo: "Busca de leads",
    itens: [
      { to: "/empresas", label: "Pesquisa de Empresas", icon: Factory },
      { to: "/socios", label: "Pesquisa por Sócios", icon: Contact },
      { to: "/exportacoes", label: "Minhas Exportações", icon: Sheet },
    ],
  },
  {
    titulo: "CRM",
    itens: [
      { to: "/minhas-empresas", label: "Minhas Empresas", icon: Briefcase },
      { to: "/email", label: "Envio de E-mail", icon: MailPlus },
      { to: "/agenda", label: "Agenda/Anotações", icon: CalendarDays },
    ],
  },
];


export function AppShell({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  async function handleSair() {
    await sair();
    await navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Topo mobile */}
      <div className="flex items-center gap-3 border-b border-edge bg-surface px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="rounded border border-edge p-1.5 text-inkMuted hover:bg-surface2"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          leads.platform
        </span>
      </div>

      {/* Overlay mobile */}
      {aberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-30 bg-bg/70 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-edge bg-surface transition-transform duration-200 md:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-edge px-4 py-4">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-widest text-accent">
              leads.platform
            </div>
            <div className="truncate text-xs text-inkMuted">
              Inteligência comercial B2B
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
            className="rounded border border-edge p-1 text-inkMuted hover:bg-surface2 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          {GRUPOS.map((grupo, indice) => (
            <div key={grupo.titulo ?? `grupo-${indice}`} className="flex flex-col gap-1">
              {grupo.titulo && (
                <div className="px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-inkMuted/70">
                  {grupo.titulo}
                </div>
              )}
              {grupo.itens.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-inkMuted transition-colors hover:bg-surface2 hover:text-ink data-[status=active]:bg-surface2 data-[status=active]:text-accent"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-edge p-3">
          {user?.email && (
            <div
              className="mb-2 truncate px-1 font-mono text-[11px] text-inkMuted"
              title={user.email}
            >
              {user.email}
            </div>
          )}
          <button
            type="button"
            onClick={handleSair}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-inkMuted transition-colors hover:bg-surface2 hover:text-ink"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      <div className="md:pl-64">{children}</div>
    </div>
  );
}

export function PageHeader({
  titulo,
  descricao,
  extra,
}: {
  titulo: string;
  descricao: string;
  extra?: ReactNode;
}) {
  return (
    <header className="border-b border-edge bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-ink">
            {titulo}
          </h1>
          <p className="font-mono text-xs text-inkMuted sm:text-sm">{descricao}</p>
        </div>
        {extra}
      </div>
    </header>
  );
}
