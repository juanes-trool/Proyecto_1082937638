import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F43F5E",
        "primary-dark": "#E11D48",
        "primary-light": "#FFF1F2",
        accent: "#D946EF",
      },
    },
  },
};

export default config;
