import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { listarEmpresasSalvas, removerEmpresaSalva } from "@/lib/api";

export const Route = createFileRoute("/minhas-empresas")({
  head: () => ({
    meta: [
      { title: "Minhas Empresas — Leads Platform" },
      {
        name: "description",
        content: "Empresas salvas e favoritadas para acompanhamento comercial.",
      },
      { property: "og:title", content: "Minhas Empresas — Leads Platform" },
      {
        property: "og:description",
        content: "Empresas salvas e favoritadas para acompanhamento comercial.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <MinhasEmpresas />
    </RotaProtegida>
  ),
});

function MinhasEmpresas() {
  const { data, isLoading } = useQuery({
    queryKey: ["empresas-salvas"],
    queryFn: listarEmpresasSalvas,
  });
  const [removidas, setRemovidas] = useState<string[]>([]);

  const empresas = (data ?? []).filter((e) => !removidas.includes(e.cnpj));

  async function remover(cnpj: string) {
    await removerEmpresaSalva(cnpj);
    setRemovidas((atual) => [...atual, cnpj]);
  }

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Minhas Empresas"
        descricao="Empresas salvas para acompanhamento"
        extra={
          <span className="font-mono text-xs text-inkMuted">
            <span className="font-semibold text-accent">{empresas.length}</span> salvas
          </span>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {isLoading && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Carregando…
          </div>
        )}

        {!isLoading && empresas.length === 0 && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Nenhuma empresa salva ainda.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((empresa) => (
            <article
              key={empresa.cnpj}
              className="flex flex-col gap-2 rounded-md border border-edge bg-surface p-4"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-ink">
                    {empresa.razao_social}
                  </h2>
                  <p className="truncate font-mono text-xs text-inkMuted">
                    {empresa.cnpj}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remover empresa salva"
                  onClick={() => void remover(empresa.cnpj)}
                  className="shrink-0 rounded border border-edge p-1.5 text-inkMuted hover:bg-surface2 hover:text-ink"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {empresa.nome_fantasia && (
                <p className="text-xs text-inkMuted">{empresa.nome_fantasia}</p>
              )}
              <p className="text-xs text-inkMuted">{empresa.cnae_descricao}</p>
              <p className="font-mono text-xs text-inkMuted">
                {empresa.municipio} / {empresa.uf} · salva em{" "}
                {new Date(empresa.salva_em).toLocaleDateString("pt-BR")}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {empresa.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-edge bg-surface2 px-2 py-0.5 font-mono text-[11px] text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
