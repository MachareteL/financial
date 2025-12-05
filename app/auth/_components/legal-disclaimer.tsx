import Link from "next/link";

export function LegalDisclaimer() {
  return (
    <p className="text-center text-xs text-muted-foreground px-8">
      Ao continuar, você concorda com nossos{" "}
      <Link
        href="/terms"
        target="_blank"
        className="underline hover:text-foreground"
      >
        Termos de Uso
      </Link>{" "}
      e{" "}
      <Link
        href="/privacy"
        target="_blank"
        className="underline hover:text-foreground"
      >
        Política de Privacidade
      </Link>
      .
    </p>
  );
}
