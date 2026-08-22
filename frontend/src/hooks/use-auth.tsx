import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/supabaseClient";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  /** true enquanto a sessão inicial ainda está sendo verificada */
  carregando: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  carregando: true,
});

/**
 * Provedor de autenticação: verifica a sessão ativa do Supabase ao montar
 * e escuta mudanças (login, logout, refresh de token) via onAuthStateChange.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSession(data.session);
      setCarregando(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      if (!ativo) return;
      setSession(novaSessao);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, carregando }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
