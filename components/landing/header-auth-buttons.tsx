"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function HeaderAuthButtons() {
  const { session } = useAuth();
  const router = useRouter();

  if (session) {
    return (
      <Button onClick={() => router.push("/dashboard")}>Ir para o App</Button>
    );
  }

  return (
    <>
      <Button variant="ghost" onClick={() => router.push("/auth")}>
        Login
      </Button>
      <Button onClick={() => router.push("/auth")}>Começar Agora</Button>
    </>
  );
}
