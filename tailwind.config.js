/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      // CTAC brand palette (Draft 37, `CTAC Colors and Fonts 2020.docx`).
      // `ctac-teal-500` / `navy` / `green-*` / `orange-*` are the exact
      // CTAC spec hexes; the teal/navy 50–900 ramps are derived shades
      // for hovers + surfaces. Teal is the primary CTA color (was amber);
      // navy is display-heading text (was slate-900).
      colors: {
        ctac: {
          teal: {
            50: '#e6f7f6',
            100: '#ccefed',
            200: '#99dfdb',
            300: '#66cfc8',
            400: '#33bfb6',
            500: '#00A79D',
            600: '#008e85',
            700: '#00756d',
            800: '#005c55',
            900: '#00433d',
          },
          navy: {
            DEFAULT: '#0E1F56',
            50: '#e7e9ee',
            100: '#c2c7d5',
            700: '#1b2f72',
            900: '#0E1F56',
          },
          green: {
            light: '#8BC53F',
            DEFAULT: '#1B9445',
            dark: '#147A38',
          },
          orange: {
            light: '#FDC030',
            DEFAULT: '#EC7424',
            dark: '#C25A1A',
          },
          purple: {
            light: '#614489',
            DEFAULT: '#392055',
          },
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
