/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4D3269",
        secondry: "#71499A",
      },
      fontFamily: {
        poppins: " 'Poppins', sans-serif",
      },
      keyframes: {
        "progress-indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        jump: {
          "15%": { "border-bottom-right-radius": "3px" },
          "25%": { transform: "translateY(9px) rotate(22.5deg)" },
          "50%": {
            transform: "translateY(18px) scale(1, 0.9) rotate(45deg)",
            "border-bottom-right-radius": "40px",
          },
          "75%": { transform: "translateY(9px) rotate(67.5deg)" },
          "100%": { transform: "translateY(0) rotate(90deg)" },
        },
        shadow: {
          "0%, 100%": { transform: "scale(1, 1)" },
          "50%": { transform: "scale(1.2, 1)" },
        },
      },
      animation: {
        "progress-indeterminate": "progress-indeterminate 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
