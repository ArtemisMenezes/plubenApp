import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { buscarSocios } from "@/lib/api";
import type { Socio } from "@/lib/types";

export const Route = createFileRoute("/socios")({
  head: () => ({
    meta: [
      { title: "Buscar Sócios — Leads Platform" },
      {
        name: "description",
        content: "Busque sócios por nome ou CPF parcial e veja as empresas vinculadas.",
      },
      { property: "og:title", content: "Buscar Sócios — Leads Platform" },
      {
        property: "og:description",
        content: "Busque sócios por nome ou CPF parcial e veja as empresas vinculadas.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <BuscarSocios />
    </RotaProtegida>
  ),
});

function BuscarSocios() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<Socio[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);

  async function buscar() {
    setCarregando(true);
    try {
      setResultados(await buscarSocios(termo));
      setBuscou(true);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Busca de Sócios"
        descricao="Quadro societário — nome do sócio"
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void buscar();
          }}
          className="mb-6 flex flex-col gap-3 rounded-md border border-edge bg-surface p-4 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">
              Nome do sócio ou CPF parcial
            </label>
            <input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="ex: maria clara ou 412"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent/90 disabled:opacity-50"
          >
            {carregando ? "Buscando…" : "Buscar"}
          </button>
        </form>

        {!buscou && !carregando && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Digite um nome ou trecho de CPF para começar.
          </div>
        )}

        {buscou && !carregando && resultados.length === 0 && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Nenhum sócio encontrado.
          </div>
        )}

        {resultados.length > 0 && (
          <div className="overflow-hidden rounded-md border border-edge bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-edge bg-surface2 text-left font-mono text-xs uppercase text-inkMuted">
                    <th className="px-3 py-2">Sócio</th>
                    <th className="px-3 py-2">CPF</th>
                    <th className="px-3 py-2">Qualificação</th>
                    <th className="px-3 py-2">Empresa vinculada</th>
                    <th className="px-3 py-2">Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((socio) => (
                    <tr
                      key={socio.id}
                      className="border-b border-edge last:border-0 hover:bg-surface2"
                    >
                      <td className="px-3 py-2 font-medium">{socio.nome}</td>
                      <td className="px-3 py-2 font-mono text-xs text-inkMuted">
                        {socio.cpf_parcial}
                      </td>
                      <td className="px-3 py-2 text-xs text-inkMuted">
                        {socio.qualificacao}
                      </td>
                      <td className="px-3 py-2">
                        {socio.empresa_razao_social}
                        <div className="font-mono text-xs text-inkMuted">
                          {socio.empresa_cnpj} · {socio.empresa_uf}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-inkMuted">
                        {new Date(socio.data_entrada).toLocaleDateString("pt-BR")}
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
