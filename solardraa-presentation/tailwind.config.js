/** @type {import('tailwindcss').Config} */
export default { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: {
  colors: { navy: '#07152c', blue: '#5cafff', ice: '#b4dfff' },
  fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'] }
}}, plugins: [] };
