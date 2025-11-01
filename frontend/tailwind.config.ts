import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/styles/**/*.css",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { textShadow: "0 0 8px rgba(34, 197, 94, 0.6)" },
          "50%": { textShadow: "0 0 16px rgba(34, 197, 94, 0.9)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        particles: {
          "0%": { transform: "translateY(0)", opacity: "0.4" },
          "50%": { transform: "translateY(-20px)", opacity: "0.8" },
          "100%": { transform: "translateY(0)", opacity: "0.4" },
        },
        beam: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 200%" },
        },
        flicker: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.6" },
          "65%": { opacity: "0.52" },
          "72%": { opacity: "0.58" },
          "85%": { opacity: "0.5" },
        },
        burst: {
          "0%": { transform: "scale(0.7)", opacity: "0.45" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
      },
      animation: {
        glow: "glow-pulse 2.5s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        particles: "particles 3.5s ease-in-out infinite",
        beam: "beam 3s linear infinite",
        flicker: "flicker 4.5s ease-in-out infinite",
        burst: "burst 0.6s ease-out 1",
      },
      boxShadow: {
        brand: "0 12px 40px -12px rgba(34, 197, 94, 0.35)",
        subtle: "0 6px 20px -8px rgba(2, 6, 23, 0.4)",
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(ellipse at top, rgba(34,197,94,0.15), transparent 60%)",
        grid: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      dropShadow: {
        glow: "0 0 24px rgba(34,197,94,0.45)",
      },
    },
  },
  plugins: [],
}

export default config
