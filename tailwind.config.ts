import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#E8EBF0",
          100: "#C5CBD6",
          200: "#9BA5B8",
          300: "#717F9A",
          400: "#4E6183",
          500: "#2B436C",
          600: "#1F3356",
          700: "#16233F",
          800: "#0F1A2E",
          900: "#080E1B",
        },
        gold: {
          50: "#FBF5EC",
          100: "#F5E6CE",
          200: "#ECD3A9",
          300: "#DFBB7E",
          400: "#C99A4A",
          500: "#B38538",
          600: "#9A6F2A",
          700: "#7D5A21",
          800: "#5F4419",
          900: "#422F11",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
