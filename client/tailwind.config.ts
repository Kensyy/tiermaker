import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          bg: "#05060a",
          glass: "rgba(255,255,255,0.045)",
          glass2: "rgba(255,255,255,0.075)",
          line: "rgba(140,220,255,0.22)",
          text: "#eaf6ff",
          muted: "#7c93a8",
          cyan: "#4cf3ff",
          magenta: "#ff3dae",
        },
        tier: {
          s: "#ff3d6a",
          a: "#ff9d3d",
          b: "#f5e14c",
          c: "#4cf3a0",
          d: "#4c9bf5",
          f: "#b34cf5",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SF Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
