import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan shadow-[0_0_12px_rgba(76,243,255,0.18)_inset] hover:bg-neon-cyan/20 hover:shadow-[0_0_16px_rgba(76,243,255,0.3)_inset]",
  secondary: "glass text-neon-text hover:bg-neon-glass2",
  danger:
    "border border-tier-s/60 bg-tier-s/10 text-tier-s hover:bg-tier-s/20",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md px-3 py-2 font-mono text-sm tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
