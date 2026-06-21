import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        workspace: "var(--color-workspace)",
        panel: "var(--color-panel)",
        panelSoft: "var(--color-panel-soft)",
        line: "var(--color-line)",
        muted: "var(--color-muted)",
        fg: "var(--color-fg)",
        accent: "var(--color-accent)",
        "accent-strong": "var(--color-accent-strong)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
