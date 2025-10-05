import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Design system colors
        bg: "#EDEFEA",
        panel: "#0F1214", 
        card: "#FFFFFF",
        muted: "#A9B1AB",
        brand: "#B5FF66",
        "brand-2": "#9DF0AE",
        accent: "#111111",
        warn: "#FFB020",
        error: "#F45B69",
        ok: "#2BD576",
        "grid-blue": "#2CB3FF",
        "cons-red": "#FF6B6B",
        "prod-gold": "#FFC857",
        "share-green": "#2EE6A7",
        // Legacy shadcn colors
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        surplus: {
          DEFAULT: "hsl(var(--surplus))",
          light: "hsl(var(--surplus-light))",
        },
        consumption: {
          DEFAULT: "hsl(var(--consumption))",
          light: "hsl(var(--consumption-light))",
        },
        grid: {
          import: "hsl(var(--grid-import))",
          export: "hsl(var(--grid-export))",
        },
        battery: {
          DEFAULT: "hsl(var(--battery))",
          reserve: "hsl(var(--battery-reserve))",
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'Montserrat', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-energy': 'var(--gradient-energy)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'card': '0 8px 30px rgba(0,0,0,0.08)',
        'glow': 'var(--shadow-glow)',
      },
      borderRadius: {
        lg: "24px",
        md: "12px", 
        sm: "8px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
