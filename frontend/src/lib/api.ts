import type {
  Anotacao,
  Email,
  EmpresaSalva,
  Exportacao,
  NovoEmail,
  Socio,
} from "./types";
import { fetchAutenticado } from "@/auth";

// URL base da API real. Mantida centralizada aqui para que a troca dos mocks
// por fetch() seja trivial. Em produção defina VITE_API_URL no ambiente.
export const API_URL: string =
  import.meta.env["VITE_API_URL"] ?? "http://localhost:8000";

async function requisicao<T>(rota: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(`${API_URL}${rota}`, {
    headers: { "Content-Type": "application/json", ...(opcoes?.headers ?? {}) },
    ...opcoes,
  });
  if (!resposta.ok) throw new Error(`Falha na API (${resposta.status})`);
  return resposta.json() as Promise<T>;
}

/** Busca sócios por nome ou CPF parcial. */
export async function buscarSocios(termo: string): Promise<Socio[]> {
  if (termo.trim().length < 2) return [];
  return requisicao(`/api/socios?termo=${encodeURIComponent(termo)}`);
}

/** Lista as empresas salvas/favoritadas pelo usuário. */
export async function listarEmpresasSalvas(): Promise<EmpresaSalva[]> {
  return requisicao("/api/empresas/salvas");
}

/** Remove uma empresa da lista de salvas. */
export async function removerEmpresaSalva(cnpj: string): Promise<{ cnpj: string }> {
  return requisicao(`/api/empresas/salvas/${cnpj}`, { method: "DELETE" });
}

/** Histórico de exportações CSV do usuário. */
export async function listarExportacoes(): Promise<Exportacao[]> {
  return requisicao("/api/exportacoes");
}

/** Histórico de e-mails enviados. */
export async function listarEmails(): Promise<Email[]> {
  return requisicao("/api/emails");
}

/** Registra o envio de um e-mail (sem envio real). */
export async function enviarEmail(novo: NovoEmail): Promise<Email> {
  return requisicao("/api/emails", { method: "POST", body: JSON.stringify(novo) });
}

/** Lista tarefas e anotações vinculadas a empresas ou sócios. */
export async function listarAnotacoes(): Promise<Anotacao[]> {
  return requisicao("/api/anotacoes");
}

/** Alterna o status de conclusão de uma anotação. */
export async function alternarAnotacao(
  id: string,
  concluida: boolean,
): Promise<{ id: string; concluida: boolean }> {
  return requisicao(`/api/anotacoes/${id}`, { method: "PATCH", body: JSON.stringify({ concluida }) });
}

export type Perfil = { empresa: Record<string, string>; usuario: Record<string, string>; plano: { nome: "standard" | "pro"; renovacao: string; consultas_usadas: number; consultas_limite: number; exportacoes_usadas: number; exportacoes_limite: number } };

// A rota /api/perfil exige o token do Supabase (Authorization: Bearer <token>),
// por isso usa fetchAutenticado em vez do requisicao() genérico acima.
async function requisicaoAutenticada<T>(rota: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetchAutenticado(`${API_URL}${rota}`, {
    headers: { "Content-Type": "application/json", ...(opcoes?.headers ?? {}) },
    ...opcoes,
  });
  if (!resposta.ok) throw new Error(`Falha na API (${resposta.status})`);
  return resposta.json() as Promise<T>;
}

export function obterPerfil(): Promise<Perfil> {
  return requisicaoAutenticada("/api/perfil");
}
export function atualizarPerfil(dados: Record<string, string>): Promise<Perfil> {
  return requisicaoAutenticada("/api/perfil", { method: "PUT", body: JSON.stringify(dados) });
}
