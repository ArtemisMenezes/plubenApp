import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { alternarAnotacao, listarAnotacoes } from "@/lib/api";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda e Anotações — Leads Platform" },
      {
        name: "description",
        content: "Tarefas e anotações vinculadas a empresas e sócios do seu funil.",
      },
      { property: "og:title", content: "Agenda e Anotações — Leads Platform" },
      {
        property: "og:description",
        content: "Tarefas e anotações vinculadas a empresas e sócios do seu funil.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <Agenda />
    </RotaProtegida>
  ),
});

function Agenda() {
  const { data, isLoading } = useQuery({
    queryKey: ["anotacoes"],
    queryFn: listarAnotacoes,
  });
  const [override, setOverride] = useState<Record<string, boolean>>({});

  const anotacoes = (data ?? []).map((a) => ({
    ...a,
    concluida: override[a.id] ?? a.concluida,
  }));

  async function alternar(id: string, concluida: boolean) {
    const resposta = await alternarAnotacao(id, concluida);
    setOverride((atual) => ({ ...atual, [resposta.id]: resposta.concluida }));
  }

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Agenda / Anotações"
        descricao="Tarefas vinculadas a empresas e sócios"
        extra={
          <span className="font-mono text-xs text-inkMuted">
            <span className="font-semibold text-accent">
              {anotacoes.filter((a) => !a.concluida).length}
            </span>{" "}
            abertas
          </span>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isLoading && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Carregando…
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {anotacoes.map((anotacao) => (
            <li
              key={anotacao.id}
              className="rounded-md border border-edge bg-surface p-4"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={anotacao.concluida}
                  onChange={(e) => void alternar(anotacao.id, e.target.checked)}
                  aria-label={`Concluir ${anotacao.titulo}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-accent"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      anotacao.concluida ? "text-inkMuted line-through" : "text-ink"
                    }`}
                  >
                    {anotacao.titulo}
                  </p>
                  <p className="mt-0.5 text-xs text-inkMuted">{anotacao.descricao}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-inkMuted">
                    <span className="rounded border border-edge bg-surface2 px-2 py-0.5 text-accent">
                      {anotacao.vinculo_tipo === "empresa" ? "empresa" : "sócio"}
                    </span>
                    <span className="truncate">{anotacao.vinculo_nome}</span>
                    <span>· prazo {new Date(anotacao.prazo).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
