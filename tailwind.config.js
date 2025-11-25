/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gray: {
                    850: '#1f2937',
                    900: '#111827',
                    950: '#0b0f19',
                }
            }
        },
    },
    plugins: [],
}
