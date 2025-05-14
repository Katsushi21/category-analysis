/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e4d87",
        secondary: "#2d7dd2",
        accent: "#32a69f",
        background: "#f7f9fc",
        "text-primary": "#2c3e50",
        border: "#e1e5ea",
        "light-gray": "#f0f2f5",
        success: "#28a745",
        warning: "#ffc107",
        danger: "#dc3545",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        default: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: ["Open Sans", "Noto Sans JP", "sans-serif"],
        heading: ["Roboto", "Noto Sans JP", "sans-serif"],
      },
    },
  },
  plugins: [],
};
