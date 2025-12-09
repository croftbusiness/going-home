/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette: Neutrals & Backgrounds
        'warm-white': '#FAF9F7',
        'soft-ivory': '#FCFAF7',
        'deep-charcoal': '#2C2A29',
        
        // Accent Palette: Calming Accents
        'muted-sage': '#A5B99A',
        'dusty-blue': '#93B0C8',
        'faint-gold': '#EBD9B5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['36px', { lineHeight: '1.2', fontWeight: '600' }],
        'section-header': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'body': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['16px', { lineHeight: '1.4', fontWeight: '400' }],
        'button': ['17px', { lineHeight: '1.1', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '24': '6rem',
      },
    },
  },
  plugins: [],
}
