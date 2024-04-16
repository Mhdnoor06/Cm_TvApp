/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-green": "#154F30",
      },
      height: {
        "60vh": "60vh",
        "40vh": "40vh",
      },
      width: {
        "50vw": "50vw",
      },
      screens: {
        xxl: "1700px",
      },
    },
  },
  plugins: [],
};
