"use client";
import { createContext, useContext, ReactNode } from "react";
import type { UserSession } from "@/domain/dto/user.types.d.ts";
import { useSession } from "@/hooks/use-session";

const AuthContext = createContext<{
  session: UserSession | null;
  loading: boolean;
}>({
  session: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session = null, isLoading: loading } = useSession();

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
