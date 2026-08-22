import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "@/components/app-shell";
import { RotaProtegida } from "@/components/rota-protegida";
import { enviarEmail, listarEmails } from "@/lib/api";
import type { Email } from "@/lib/types";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "E-mail — Leads Platform" },
      {
        name: "description",
        content: "Componha mensagens para leads e acompanhe o histórico de envios.",
      },
      { property: "og:title", content: "E-mail — Leads Platform" },
      {
        property: "og:description",
        content: "Componha mensagens para leads e acompanhe o histórico de envios.",
      },
    ],
  }),
  component: () => (
    <RotaProtegida>
      <EmailPage />
    </RotaProtegida>
  ),
});

const STATUS_LABEL: Record<Email["status"], string> = {
  enviado: "Enviado",
  rascunho: "Rascunho",
  falhou: "Falhou",
};

function EmailPage() {
  const { data } = useQuery({ queryKey: ["emails"], queryFn: listarEmails });
  const [enviados, setEnviados] = useState<Email[]>([]);
  const [para, setPara] = useState("");
  const [assunto, setAssunto] = useState("");
  const [corpo, setCorpo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const historico = [...enviados, ...(data ?? [])];

  async function enviar() {
    setEnviando(true);
    setAviso(null);
    try {
      const email = await enviarEmail({ para, assunto, corpo });
      setEnviados((atual) => [email, ...atual]);
      setPara("");
      setAssunto("");
      setCorpo("");
      setAviso("Rascunho salvo no histórico. Configure SMTP para habilitar o envio real.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader
        titulo="E-mail"
        descricao="Composição e histórico de mensagens"
      />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
          className="flex flex-col gap-3 rounded-md border border-edge bg-surface p-4"
        >
          <div>
            <label className="mb-1 block font-mono text-xs text-inkMuted">Para</label>
            <input
              type="email"
              required
              value={para}
              onChange={(e) => setPara(e.target.value)}
              placeholder="contato@empresa.com.br"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-inkMuted">Assunto</label>
            <input
              required
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Proposta comercial"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-inkMuted">Corpo</label>
            <textarea
              required
              rows={8}
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              placeholder="Escreva sua mensagem…"
              className="w-full rounded border border-edge bg-bg px-2 py-1.5 text-sm text-ink placeholder:text-inkMuted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent/90 disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
            {aviso && <span className="font-mono text-xs text-inkMuted">{aviso}</span>}
          </div>
        </form>

        <section className="rounded-md border border-edge bg-surface">
          <h2 className="border-b border-edge px-4 py-3 font-mono text-xs uppercase tracking-widest text-inkMuted">
            Histórico de envios
          </h2>
          <ul>
            {historico.map((email) => (
              <li
                key={email.id}
                className="border-b border-edge px-4 py-3 last:border-0 hover:bg-surface2"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
                  <p className="truncate text-sm font-medium text-ink">{email.assunto}</p>
                  <span className="shrink-0 font-mono text-[11px] text-inkMuted">
                    {STATUS_LABEL[email.status]}
                  </span>
                </div>
                <p className="truncate font-mono text-xs text-inkMuted">{email.para}</p>
                <p className="mt-1 line-clamp-2 text-xs text-inkMuted">{email.corpo}</p>
                <p className="mt-1 font-mono text-[11px] text-inkMuted">
                  {new Date(email.enviado_em).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
