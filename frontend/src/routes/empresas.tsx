import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { API_URL } from "@/lib/api";
import type { Empresa } from "@/lib/types";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Buscar Empresas — Leads Platform" },
      {
        name: "description",
        content:
          "Busque e exporte empresas brasileiras a partir do Cadastro Nacional de CNPJ.",
      },
      { property: "og:title", content: "Buscar Empresas — Leads Platform" },
      {
        property: "og:description",
        content:
          "Busque e exporte empresas brasileiras a partir do Cadastro Nacional de CNPJ.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <BuscarEmpresas />
    </RotaProtegida>
  ),
});

type Filtros = {
  uf: string;
  cnae: string;
  porte: string;
  razao_social: string;
  capital_social_min: string;
  matriz_filial: string;
  natureza_juridica: string;
  data_abertura_min: string;
  data_abertura_max: string;
  bairro: string;
  cep: string;
  municipio: string;
};

const FILTROS_VAZIOS: Filtros = {
  uf: "",
  cnae: "",
  porte: "",
  razao_social: "",
  capital_social_min: "",
  matriz_filial: "",
  natureza_juridica: "",
  data_abertura_min: "",
  data_abertura_max: "",
  bairro: "",
  cep: "",
  municipio: "",
};

const PORTES: Record<string, string> = {
  "00": "Não informado",
  "01": "Microempresa",
  "03": "Pequeno porte",
  "05": "Demais",
};

const MATRIZ_FILIAL: Record<string, string> = {
  "1": "Matriz",
  "2": "Filial",
};

function montarQueryString(filtros: Filtros, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) params.set(chave, valor);
  });
  Object.entries(extra).forEach(([chave, valor]) => params.set(chave, valor));
  return params.toString();
}

function BuscarEmpresas() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [resultados, setResultados] = useState<Empresa[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [buscou, setBuscou] = useState(false);

  const TAMANHO_PAGINA = 50;
  const totalPaginas = total ? Math.ceil(total / TAMANHO_PAGINA) : 0;

  async function buscar(novaPagina: number = 1) {
    setCarregando(true);
    setErro(null);
    try {
      const qs = montarQueryString(filtros, {
        pagina: String(novaPagina),
        tamanho_pagina: String(TAMANHO_PAGINA),
      });
      const resp = await fetch(`${API_URL}/api/empresas?${qs}`);
      if (!resp.ok) throw new Error(`A busca falhou (status ${resp.status})`);
      const dados = (await resp.json()) as { resultados: Empresa[]; total: number };
      setResultados(dados.resultados);
      setTotal(dados.total);
      setPagina(novaPagina);
      setBuscou(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido na busca");
    } finally {
      setCarregando(false);
    }
  }

  function exportarCsv() {
    const qs = montarQueryString(filtros);
    // Delega o download direto ao navegador — o backend já manda os
    // headers de Content-Disposition corretos, então isso baixa o
    // arquivo sem precisarmos manipular blob no cliente.
    window.location.href = `${API_URL}/api/empresas/export?${qs}`;
  }

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Busca de Empresas"
        descricao="Cadastro Nacional de CNPJ — dados públicos, Receita Federal"
        extra={
          total !== null ? (
            <div className="text-right font-mono text-xs text-inkMuted sm:text-sm">
              <span className="font-semibold text-accent">
                {total.toLocaleString("pt-BR")}
              </span>{" "}
              empresas
            </div>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* ---------- Formulário de filtro ---------- */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void buscar(1);
          }}
          className="mb-6 grid grid-cols-2 gap-3 rounded-md border border-edge bg-surface p-4 md:grid-cols-6"
        >
          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">UF</label>
            <input
              maxLength={2}
              value={filtros.uf}
              onChange={(e) => setFiltros({ ...filtros, uf: e.target.value.toUpperCase() })}
              placeholder="SP"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm uppercase text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">CNAE</label>
            <input
              value={filtros.cnae}
              onChange={(e) => setFiltros({ ...filtros, cnae: e.target.value })}
              placeholder="6201500"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">Porte</label>
            <select
              value={filtros.porte}
              onChange={(e) => setFiltros({ ...filtros, porte: e.target.value })}
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Todos</option>
              {Object.entries(PORTES).map(([codigo, nome]) => (
                <option key={codigo} value={codigo}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block font-mono text-xs text-inkMuted">
              Razão social contém
            </label>
            <input
              value={filtros.razao_social}
              onChange={(e) => setFiltros({ ...filtros, razao_social: e.target.value })}
              placeholder="ex: comércio de"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">
              Capital mín. (R$)
            </label>
            <input
              type="number"
              min={0}
              value={filtros.capital_social_min}
              onChange={(e) =>
                setFiltros({ ...filtros, capital_social_min: e.target.value })
              }
              placeholder="0"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">Município</label>
            <input
              value={filtros.municipio}
              onChange={(e) => setFiltros({ ...filtros, municipio: e.target.value })}
              placeholder="ex: Fortaleza"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">Bairro</label>
            <input
              value={filtros.bairro}
              onChange={(e) => setFiltros({ ...filtros, bairro: e.target.value })}
              placeholder="ex: Centro"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">CEP</label>
            <input
              value={filtros.cep}
              onChange={(e) => setFiltros({ ...filtros, cep: e.target.value })}
              placeholder="60000-000"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">Matriz/Filial</label>
            <select
              value={filtros.matriz_filial}
              onChange={(e) => setFiltros({ ...filtros, matriz_filial: e.target.value })}
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Todos</option>
              {Object.entries(MATRIZ_FILIAL).map(([codigo, nome]) => (
                <option key={codigo} value={codigo}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">
              Natureza Jurídica
            </label>
            <input
              value={filtros.natureza_juridica}
              onChange={(e) =>
                setFiltros({ ...filtros, natureza_juridica: e.target.value })
              }
              placeholder="ex: 2062"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">
              Abertura de
            </label>
            <input
              type="date"
              value={filtros.data_abertura_min}
              onChange={(e) =>
                setFiltros({ ...filtros, data_abertura_min: e.target.value })
              }
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block font-mono text-xs text-inkMuted">
              Abertura até
            </label>
            <input
              type="date"
              value={filtros.data_abertura_max}
              onChange={(e) =>
                setFiltros({ ...filtros, data_abertura_max: e.target.value })
              }
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="col-span-2 flex flex-wrap gap-2 pt-1 md:col-span-6">
            <button
              type="submit"
              disabled={carregando}
              className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent/90 disabled:opacity-50"
            >
              {carregando ? "Buscando…" : "Buscar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltros(FILTROS_VAZIOS);
              }}
              className="rounded border border-edge px-4 py-2 text-sm font-medium text-inkMuted hover:bg-surface2"
            >
              Limpar filtros
            </button>
            {total !== null && total > 0 && (
              <button
                type="button"
                onClick={exportarCsv}
                className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent/90 sm:ml-auto"
              >
                Exportar CSV ({Math.min(total, 100000).toLocaleString("pt-BR")} linhas)
              </button>
            )}
          </div>
        </form>

        {erro && (
          <div className="mb-4 rounded border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {erro}
          </div>
        )}

        {/* ---------- Resultados ---------- */}
        {!buscou && !carregando && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Defina filtros e clique em &quot;Buscar&quot; para começar.
          </div>
        )}

        {buscou && !carregando && resultados.length === 0 && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Nenhuma empresa encontrada com esses filtros.
          </div>
        )}

        {resultados.length > 0 && (
          <div className="overflow-hidden rounded-md border border-edge bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-edge bg-surface2 text-left font-mono text-xs uppercase text-inkMuted">
                    <th className="px-3 py-2">CNPJ</th>
                    <th className="px-3 py-2">Razão social</th>
                    <th className="px-3 py-2">Município/UF</th>
                    <th className="px-3 py-2">CNAE</th>
                    <th className="px-3 py-2 text-right">Capital social</th>
                    <th className="px-3 py-2">Contato</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((empresa) => (
                    <tr
                      key={empresa.cnpj}
                      className="border-b border-edge last:border-0 hover:bg-surface2"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-inkMuted">
                        {empresa.cnpj}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {empresa.razao_social}
                        {empresa.nome_fantasia && (
                          <div className="text-xs text-inkMuted">
                            {empresa.nome_fantasia}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-inkMuted">
                        {empresa.municipio_descricao} / {empresa.uf}
                      </td>
                      <td className="px-3 py-2 text-xs text-inkMuted">
                        {empresa.cnae_descricao}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {empresa.capital_social
                          ? empresa.capital_social.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-inkMuted">
                        {empresa.email && <div>{empresa.email}</div>}
                        {empresa.telefone1 && (
                          <div>
                            ({empresa.ddd1}) {empresa.telefone1}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---------- Paginação ---------- */}
            <div className="flex items-center justify-between border-t border-edge px-3 py-3 text-sm">
              <span className="font-mono text-xs text-inkMuted">
                Página {pagina} de {totalPaginas}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagina <= 1 || carregando}
                  onClick={() => void buscar(pagina - 1)}
                  className="rounded border border-edge px-3 py-1 text-ink hover:bg-surface2 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  disabled={pagina >= totalPaginas || carregando}
                  onClick={() => void buscar(pagina + 1)}
                  className="rounded border border-edge px-3 py-1 text-ink hover:bg-surface2 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}