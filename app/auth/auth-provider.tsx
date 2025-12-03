"use client";
import { createContext, useContext, ReactNode, useCallback } from "react";
import type { UserSession } from "@/domain/dto/user.types.d.ts";
import { useSession } from "@/hooks/use-session";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext<{
  session: UserSession | null;
  loading: boolean;
  setSession: (session: UserSession | null) => void;
}>({
  session: null,
  loading: true,
  setSession: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session = null, isLoading: loading } = useSession();
  const queryClient = useQueryClient();

  const setSession = useCallback(
    (newSession: UserSession | null) => {
      queryClient.setQueryData(["user-session"], newSession);
    },
    [queryClient]
  );

  return (
    <AuthContext.Provider value={{ session, loading, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}
