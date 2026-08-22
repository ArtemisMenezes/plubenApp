import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { obterConfiguracoes } from "@/lib/api";
import type { Configuracoes as ConfiguracoesTipo } from "@/lib/types";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Pluben" },
      {
        name: "description",
        content:
          "Preferências da conta Pluben: notificações, idioma, fuso horário e exportação.",
      },
      { property: "og:title", content: "Configurações — Pluben" },
      {
        property: "og:description",
        content:
          "Preferências da conta Pluben: notificações, idioma, fuso horário e exportação.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <Configuracoes />
    </RotaProtegida>
  ),
});

function Interruptor({
  rotulo,
  descricao,
  ativo,
  onChange,
}: {
  rotulo: string;
  descricao: string;
  ativo: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-edge px-4 py-3 last:border-0">
      <div className="min-w-0">
        <div className="text-sm text-ink">{rotulo}</div>
        <div className="font-mono text-xs text-inkMuted">{descricao}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ativo}
        aria-label={rotulo}
        onClick={() => onChange(!ativo)}
        className={`mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors ${
          ativo ? "border-accent/50 bg-accent/30" : "border-edge bg-surface2"
        }`}
      >
        <span
          className={`block h-3.5 w-3.5 rounded-full bg-ink transition-transform ${
            ativo ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

function Configuracoes() {
  const { data } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: obterConfiguracoes,
  });
  const [estado, setEstado] = useState<ConfiguracoesTipo | null>(null);

  useEffect(() => {
    if (data) setEstado(data);
  }, [data]);

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Configurações"
        descricao="Preferências da conta (dados simulados, sem persistência)"
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        {!estado && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Carregando…
          </div>
        )}

        {estado && (
          <>
            <section className="rounded-md border border-edge bg-surface">
              <div className="border-b border-edge px-4 py-3 font-mono text-xs uppercase tracking-widest text-inkMuted">
                Notificações
              </div>
              <Interruptor
                rotulo="Alertas por e-mail"
                descricao="Resumo diário de novos leads compatíveis."
                ativo={estado.notificacoes_email}
                onChange={(v) => setEstado({ ...estado, notificacoes_email: v })}
              />
              <Interruptor
                rotulo="Resumo semanal"
                descricao="Relatório de desempenho das buscas e exportações."
                ativo={estado.resumo_semanal}
                onChange={(v) => setEstado({ ...estado, resumo_semanal: v })}
              />
              <Interruptor
                rotulo="Avisos de limite do plano"
                descricao="Notificar quando atingir 80% das consultas do mês."
                ativo={estado.alerta_limite}
                onChange={(v) => setEstado({ ...estado, alerta_limite: v })}
              />
            </section>

            <section className="rounded-md border border-edge bg-surface">
              <div className="border-b border-edge px-4 py-3 font-mono text-xs uppercase tracking-widest text-inkMuted">
                Preferências
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-inkMuted/70">
                    Idioma
                  </span>
                  <select
                    value={estado.idioma}
                    onChange={(e) =>
                      setEstado({ ...estado, idioma: e.target.value })
                    }
                    className="rounded border border-edge bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-inkMuted/70">
                    Fuso horário
                  </span>
                  <select
                    value={estado.fuso}
                    onChange={(e) => setEstado({ ...estado, fuso: e.target.value })}
                    className="rounded border border-edge bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  >
                    <option value="America/Fortaleza">America/Fortaleza</option>
                    <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                    <option value="UTC">UTC</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-inkMuted/70">
                    Separador do CSV
                  </span>
                  <select
                    value={estado.separador_csv}
                    onChange={(e) =>
                      setEstado({ ...estado, separador_csv: e.target.value })
                    }
                    className="rounded border border-edge bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  >
                    <option value=";">Ponto e vírgula (;)</option>
                    <option value=",">Vírgula (,)</option>
                    <option value="\t">Tabulação</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-inkMuted/70">
                    Resultados por página
                  </span>
                  <select
                    value={String(estado.resultados_por_pagina)}
                    onChange={(e) =>
                      setEstado({
                        ...estado,
                        resultados_por_pagina: Number(e.target.value),
                      })
                    }
                    className="rounded border border-edge bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </label>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20"
              >
                Salvar preferências
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
