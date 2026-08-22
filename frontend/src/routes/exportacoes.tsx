import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { listarExportacoes } from "@/lib/api";
import type { Exportacao } from "@/lib/types";

export const Route = createFileRoute("/exportacoes")({
  head: () => ({
    meta: [
      { title: "Minhas Exportações — Leads Platform" },
      {
        name: "description",
        content: "Histórico de exportações CSV com filtros usados e link de download.",
      },
      { property: "og:title", content: "Minhas Exportações — Leads Platform" },
      {
        property: "og:description",
        content: "Histórico de exportações CSV com filtros usados e link de download.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <Exportacoes />
    </RotaProtegida>
  ),
});

const STATUS_LABEL: Record<Exportacao["status"], string> = {
  concluida: "Concluída",
  processando: "Processando",
  erro: "Erro",
};

function Exportacoes() {
  const { data, isLoading } = useQuery({
    queryKey: ["exportacoes"],
    queryFn: listarExportacoes,
  });
  const exportacoes = data ?? [];

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Minhas Exportações"
        descricao="Histórico de arquivos CSV gerados (dados simulados)"
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isLoading && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Carregando…
          </div>
        )}

        {!isLoading && exportacoes.length === 0 && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Nenhuma exportação registrada.
          </div>
        )}

        {exportacoes.length > 0 && (
          <div className="overflow-hidden rounded-md border border-edge bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-edge bg-surface2 text-left font-mono text-xs uppercase text-inkMuted">
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">Filtros usados</th>
                    <th className="px-3 py-2 text-right">Linhas</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Arquivo</th>
                  </tr>
                </thead>
                <tbody>
                  {exportacoes.map((exp) => (
                    <tr
                      key={exp.id}
                      className="border-b border-edge last:border-0 hover:bg-surface2"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-inkMuted">
                        {new Date(exp.criada_em).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(exp.filtros).map(([chave, valor]) => (
                            <span
                              key={chave}
                              className="rounded border border-edge bg-surface2 px-2 py-0.5 font-mono text-[11px] text-inkMuted"
                            >
                              {chave}={valor}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {exp.linhas.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-inkMuted">
                        {STATUS_LABEL[exp.status]}
                      </td>
                      <td className="px-3 py-2">
                        {exp.status === "concluida" ? (
                          <a
                            href={exp.download_url}
                            className="font-mono text-xs text-accent hover:underline"
                          >
                            {exp.arquivo}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-inkMuted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
