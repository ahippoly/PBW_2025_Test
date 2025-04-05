/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        header: "#154515",
      },
      textColor: {
        DEFAULT: "#000000",
        header: "#154515",
      },
    },
  },
  plugins: [],
};
