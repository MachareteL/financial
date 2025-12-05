import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 32, height = 32 }: LogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg overflow-hidden",
        className
      )}
      style={{ width, height }}
    >
      <Image
        src="/logo.svg"
        alt="Lemon Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}
