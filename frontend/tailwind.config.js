/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#5FB3B3',
                secondary: '#A7DAD9',
                accent: '#7B61FF',
                background: '#EEF6F6',
                textPrimary: '#1F2D2E',
                textMuted: '#6B7C7D',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
