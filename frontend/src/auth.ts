import { supabase } from "./supabaseClient";

export async function cadastrar(email: string, senha: string, nome: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome }, // vai para raw_user_meta_data, usado pela trigger no banco
    },
  });
  if (error) throw error;
  return data;
}

export async function entrar(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw error;
  return data;
}

export async function sair() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Pega o token atual para anexar nas chamadas ao backend FastAPI.
export async function tokenAtual(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// Wrapper de fetch que já manda o Authorization: Bearer <token>
// nas chamadas para sua API FastAPI.
export async function fetchAutenticado(url: string, options: RequestInit = {}) {
  const token = await tokenAtual();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}