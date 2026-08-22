import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

import { entrar } from "@/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Leads Platform" },
      {
        name: "description",
        content: "Acesse sua conta na Leads Platform.",
      },
    ],
  }),
  component: Login,
});

function mensagemErro(erro: unknown): string {
  const msg = erro instanceof Error ? erro.message : "";
  if (/invalid login credentials/i.test(msg)) {
    return "Email ou senha inválidos.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "Confirme seu email antes de entrar.";
  }
  return msg || "Não foi possível entrar. Tente novamente.";
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
      await navigate({ to: "/" });
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
          <h1 className="mt-2 text-lg font-semibold text-ink">Entrar</h1>
          <p className="mt-1 font-mono text-xs text-inkMuted">
            Acesse sua conta para continuar
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
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
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-xs text-inkMuted">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-accent hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
