import type { Config } from "tailwindcss";

const config = {
  darkMode: "class", // <--- MAKE SURE THIS IS HERE
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  // ... rest of config
} satisfies Config;

export default config;
