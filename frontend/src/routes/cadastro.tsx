import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

import { cadastrar } from "@/auth";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Leads Platform" },
      {
        name: "description",
        content: "Crie sua conta na Leads Platform.",
      },
    ],
  }),
  component: Cadastro,
});

function mensagemErro(erro: unknown): string {
  const msg = erro instanceof Error ? erro.message : "";
  if (/already registered|already exists|user already/i.test(msg)) {
    return "Este email já está cadastrado.";
  }
  if (/password should be at least/i.test(msg)) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  return msg || "Não foi possível criar a conta. Tente novamente.";
}

function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setAviso(null);

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      const dados = await cadastrar(email, senha, nome);
      if (!dados.session) {
        setAviso("Verifique seu email para confirmar a conta.");
      } else {
        await navigate({ to: "/" });
      }
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-md border border-edge bg-surface p-6">
        <div className="mb-6 text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-accent">
            leads.platform
          </div>
          <h1 className="mt-2 text-lg font-semibold text-ink">Criar conta</h1>
          <p className="mt-1 font-mono text-xs text-inkMuted">
            Comece a usar a plataforma
          </p>
        </div>

        {aviso ? (
          <div className="rounded border border-accent/40 bg-accent/10 px-3 py-3 text-center text-sm text-accent">
            {aviso}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block font-mono text-xs text-inkMuted">
                Nome
              </label>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-inkMuted">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com.br"
                className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-inkMuted">
                Senha
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-xs text-inkMuted">
                Confirmar senha
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repita a senha"
                className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {erro && (
              <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-1 rounded bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent/90 disabled:opacity-50"
            >
              {enviando ? "Criando conta…" : "Criar conta"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center font-mono text-xs text-inkMuted">
          Já tem conta?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
