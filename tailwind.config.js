/** @type {import('tailwindcss').Config} */
module.exports = {
  // Arquivos onde o Tailwind procura as classes usadas (inclui as que o JS adiciona/remove).
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {},
  },
  plugins: [],
};
