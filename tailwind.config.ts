import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFFFFF",
        surface: {
          DEFAULT: "#F4F5F7",
          soft: "#FAFAFA",
          gray: "#EAECEF",
          hover: "#EAECEF",
        },
        "surface-gray": "#EAECEF",
        ink: {
          DEFAULT: "#0D1117",
          deep: "#000000",
          charcoal: "#1F2328",
          slate: "#4B5563",
          steel: "#4B5563",
          muted: "#6B7280",
        },
        "deep-ink": "#000000",
        primary: {
          DEFAULT: "#0D1117",
          pressed: "#000000",
          deep: "#000000",
        },
        accent: {
          lime: "#C6FF33",
          "lime-hover": "#B5F01E",
        },
        "accent-lime": "#C6FF33",
        "accent-lime-hover": "#B5F01E",
        "electric-lime": "#C6FF33",
        "electric-lime-hover": "#B5F01E",
        hairline: {
          DEFAULT: "#E5E7EB",
          subtle: "#F3F4F6",
          strong: "#D1D5DB",
          white: "rgba(255, 255, 255, 0.18)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(13, 17, 23, 0.04)",
        xs: "0 1px 3px 0 rgba(13, 17, 23, 0.06)",
        sm: "0 2px 8px 0 rgba(13, 17, 23, 0.06)",
        md: "0 8px 20px -4px rgba(13, 17, 23, 0.10)",
        xl: "0 16px 36px -8px rgba(13, 17, 23, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
