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
        // Define color variables for light mode
        light: {
          background: "#ffffff", // Light background
          foreground: "#000000", // Light foreground (text)
          primary: "#3b82f6",    // Light primary color (blue)
          secondary: "#fbbf24",  // Light secondary color (yellow)
          accent: "#eab308",     // Light accent color (green)
        },
        // Define color variables for dark mode
        dark: {
          background: "#1f1f1f", // Dark background
          foreground: "#ffffff", // Dark foreground (text)
          primary: "#2563eb",    // Dark primary color (blue)
          secondary: "#f59e0b",  // Dark secondary color (yellow)
          accent: "#65a30d",     // Dark accent color (green)
        },
      },
      fontFamily: {
        dancing: ['Dancing Script', 'serif'],
        stix: ['STIX Two Text', 'serif'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'), 
  ],
  darkMode: 'class',  
};

export default config;
