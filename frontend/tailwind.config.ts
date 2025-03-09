import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "4xl": [
          "2.5rem",
          {
            lineHeight: "2.8rem",
            letterSpacing: "-0.05rem",
          },
        ],
        "3xl": ["2rem", { lineHeight: "2.4rem", letterSpacing: "-0.027rem" }],
        "2xl": [
          "1.5rem",
          { lineHeight: "1.725rem", letterSpacing: "−0.0075rem" },
        ],
        base: ["1rem", { lineHeight: "1.3rem", letterSpacing: "0.012rem" }],
      },
      colors: {
        primary: "#FF634D",
        "primary-dark": "#E53935",
        red: "#FF453A",
        yellow: "#FF9F0A",
        green: "#30D158",
      },
    },
  },
  plugins: [],
} satisfies Config;
