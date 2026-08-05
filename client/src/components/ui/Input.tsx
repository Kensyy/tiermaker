import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`rounded-md border border-neon-line bg-neon-glass px-3 py-2 text-sm text-neon-text placeholder:text-neon-muted focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(76,243,255,0.25)] focus:outline-none ${className}`}
      {...props}
    />
  );
}
