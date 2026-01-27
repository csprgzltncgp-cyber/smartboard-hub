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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // CGP Custom Colors
        cgp: {
          teal: "hsl(var(--cgp-teal))",
          "teal-foreground": "hsl(var(--cgp-teal-foreground))",
          "teal-light": "hsl(var(--cgp-teal-light))",
          "teal-hover": "hsl(var(--cgp-teal-hover))",
          "form-bg": "hsl(var(--cgp-form-bg))",
          "input-placeholder": "hsl(var(--cgp-input-placeholder))",
          error: "hsl(var(--cgp-error))",
          "error-foreground": "hsl(var(--cgp-error-foreground))",
          "task-today": "hsl(var(--cgp-task-today))",
          "badge-new": "hsl(var(--cgp-badge-new))",
          "badge-lastday": "hsl(var(--cgp-badge-lastday))",
          "badge-overdue": "hsl(var(--cgp-badge-overdue))",
          "task-completed-purple": "hsl(var(--cgp-task-completed-purple))",
          "link": "hsl(var(--cgp-link))",
          "link-hover": "hsl(var(--cgp-link-hover))",
          // List colors
          "list-bg": "hsl(var(--cgp-list-bg))",
          "list-active": "hsl(var(--cgp-list-active-bg))",
          "status-active": "hsl(var(--cgp-status-active))",
          "status-pending": "hsl(var(--cgp-status-pending))",
          "delete-purple": "hsl(var(--cgp-delete-purple))",
        },
      },
      fontFamily: {
        calibri: ['Calibri', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
