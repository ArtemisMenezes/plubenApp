import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";

/**
 * Envolve páginas que exigem usuário autenticado. Enquanto a sessão do
 * Supabase ainda está sendo verificada, mostra um estado de carregamento;
 * se não houver usuário logado, redireciona para /login.
 */
export function RotaProtegida({ children }: { children: ReactNode }) {
  const { user, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="font-mono text-xs uppercase tracking-widest text-inkMuted">
          Verificando sessão…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
