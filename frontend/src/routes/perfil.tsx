import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { atualizarPerfil, obterPerfil, type Perfil as PerfilTipo } from "@/lib/api";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Pluben" },
      {
        name: "description",
        content:
          "Informações da empresa Pluben, dados pessoais do usuário e plano contratado.",
      },
      { property: "og:title", content: "Perfil — Pluben" },
      {
        property: "og:description",
        content:
          "Informações da empresa Pluben, dados pessoais do usuário e plano contratado.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <Perfil />
    </RotaProtegida>
  ),
});

type EmpresaForm = {
  nome: string;
  razao_social: string;
  cnpj: string;
  segmento: string;
  telefone: string;
  municipio: string;
  uf: string;
};

function campoVazio(): EmpresaForm {
  return {
    nome: "",
    razao_social: "",
    cnpj: "",
    segmento: "",
    telefone: "",
    municipio: "",
    uf: "",
  };
}

function formDaEmpresa(empresa: Record<string, string>): EmpresaForm {
  return {
    nome: empresa["nome"] ?? "",
    razao_social: empresa["razao_social"] ?? "",
    cnpj: empresa["cnpj"] ?? "",
    segmento: empresa["segmento"] ?? "",
    telefone: empresa["telefone"] ?? "",
    municipio: empresa["municipio"] ?? "",
    uf: empresa["uf"] ?? "",
  };
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-inkMuted/70">
        {rotulo}
      </span>
      <span className="truncate text-sm text-ink">{valor}</span>
    </div>
  );
}

function CampoEditavel({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-inkMuted/70">
        {rotulo}
      </span>
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
  );
}

function Cartao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-edge bg-surface">
      <div className="border-b border-edge px-4 py-3 font-mono text-xs uppercase tracking-widest text-inkMuted">
        {titulo}
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Perfil() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["perfil"],
    queryFn: obterPerfil,
  });

  const [form, setForm] = useState<EmpresaForm>(campoVazio());
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(formDaEmpresa(data.empresa));
  }, [data]);

  const salvar = useMutation({
    mutationFn: (dados: EmpresaForm) => atualizarPerfil(dados),
    onSuccess: (perfilAtualizado: PerfilTipo) => {
      queryClient.setQueryData(["perfil"], perfilAtualizado);
      setAviso("Dados salvos com sucesso.");
    },
    onError: () => setAviso("Não foi possível salvar. Tente novamente."),
  });

  function atualizarCampo(chave: keyof EmpresaForm, valor: string) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="Perfil"
        descricao="Dados da empresa, informações pessoais e plano contratado"
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        {isLoading && (
          <div className="py-16 text-center font-mono text-sm text-inkMuted">
            Carregando…
          </div>
        )}

        {data && (
          <>
            <section className="flex flex-col gap-4 rounded-md border border-edge bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-edge bg-surface2 font-mono text-lg text-accent">
                  {(data.empresa["nome"] ?? "").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-ink">
                    {data.empresa["nome"]}
                  </div>
                  <div className="font-mono text-xs text-inkMuted">
                    {data.empresa["cnpj"]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start rounded border border-accent/40 bg-accent/10 px-3 py-1.5 sm:self-auto">
                <BadgeCheck className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs uppercase tracking-widest text-accent">
                  Plano {data.plano.nome}
                </span>
              </div>
            </section>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAviso(null);
                salvar.mutate(form);
              }}
            >
              <section className="rounded-md border border-edge bg-surface">
                <div className="border-b border-edge px-4 py-3 font-mono text-xs uppercase tracking-widest text-inkMuted">
                  Informações da empresa
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  <CampoEditavel
                    rotulo="Nome"
                    valor={form.nome}
                    onChange={(v) => atualizarCampo("nome", v)}
                  />
                  <CampoEditavel
                    rotulo="Razão social"
                    valor={form.razao_social}
                    onChange={(v) => atualizarCampo("razao_social", v)}
                  />
                  <CampoEditavel
                    rotulo="CNPJ"
                    valor={form.cnpj}
                    onChange={(v) => atualizarCampo("cnpj", v)}
                  />
                  <CampoEditavel
                    rotulo="Segmento"
                    valor={form.segmento}
                    onChange={(v) => atualizarCampo("segmento", v)}
                  />
                  <CampoEditavel
                    rotulo="Telefone"
                    valor={form.telefone}
                    onChange={(v) => atualizarCampo("telefone", v)}
                  />
                  <CampoEditavel
                    rotulo="Município"
                    valor={form.municipio}
                    onChange={(v) => atualizarCampo("municipio", v)}
                  />
                  <CampoEditavel
                    rotulo="UF"
                    valor={form.uf}
                    onChange={(v) => atualizarCampo("uf", v)}
                  />
                  <Campo rotulo="Site" valor={data.empresa["site"] ?? ""} />
                </div>
                <div className="flex items-center gap-3 border-t border-edge px-4 py-3">
                  <button
                    type="submit"
                    disabled={salvar.isPending}
                    className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent/90 disabled:opacity-50"
                  >
                    {salvar.isPending ? "Salvando…" : "Salvar alterações"}
                  </button>
                  {aviso && (
                    <span className="font-mono text-xs text-inkMuted">{aviso}</span>
                  )}
                </div>
              </section>
            </form>

            <Cartao titulo="Informações pessoais">
              <Campo rotulo="Nome" valor={data.usuario["nome"] ?? ""} />
              <Campo rotulo="Cargo" valor={data.usuario["cargo"] ?? ""} />
              <Campo rotulo="E-mail" valor={data.usuario["email"] ?? ""} />
              <Campo rotulo="Telefone" valor={data.usuario["telefone"] ?? ""} />
              <Campo rotulo="CPF" valor={data.usuario["cpf_parcial"] ?? ""} />
              <Campo
                rotulo="Membro desde"
                valor={
                  data.usuario["membro_desde"]
                    ? new Date(data.usuario["membro_desde"]).toLocaleDateString(
                        "pt-BR",
                      )
                    : ""
                }
              />
            </Cartao>

            <section className="rounded-md border border-edge bg-surface">
              <div className="border-b border-edge px-4 py-3 font-mono text-xs uppercase tracking-widest text-inkMuted">
                Plano contratado
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                <Campo rotulo="Plano" valor={data.plano.nome} />
                <Campo rotulo="Renovação" valor={data.plano.renovacao} />
                <Campo
                  rotulo="Consultas no mês"
                  valor={`${data.plano.consultas_usadas.toLocaleString("pt-BR")} / ${data.plano.consultas_limite.toLocaleString("pt-BR")}`}
                />
                <Campo
                  rotulo="Exportações no mês"
                  valor={`${data.plano.exportacoes_usadas} / ${data.plano.exportacoes_limite}`}
                />
              </div>
              <div className="flex flex-wrap gap-2 border-t border-edge px-4 py-3">
                {(["standard", "pro"] as const).map((opcao) => (
                  <span
                    key={opcao}
                    className={`rounded border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${
                      data.plano.nome.toLowerCase() === opcao
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-edge bg-surface2 text-inkMuted"
                    }`}
                  >
                    {opcao}
                  </span>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
