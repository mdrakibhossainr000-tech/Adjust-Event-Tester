/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", /* white-10 */
        input: "var(--color-input)", /* gray-700 */
        ring: "var(--color-ring)", /* blue-500 */
        background: "var(--color-background)", /* gray-900 */
        foreground: "var(--color-foreground)", /* gray-50 */
        primary: {
          DEFAULT: "var(--color-primary)", /* blue-500 */
          foreground: "var(--color-primary-foreground)", /* white */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* gray-600 */
          foreground: "var(--color-secondary-foreground)", /* gray-50 */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* red-400 */
          foreground: "var(--color-destructive-foreground)", /* white */
        },
        muted: {
          DEFAULT: "var(--color-muted)", /* gray-700 */
          foreground: "var(--color-muted-foreground)", /* gray-400 */
        },
        accent: {
          DEFAULT: "var(--color-accent)", /* blue-500 */
          foreground: "var(--color-accent-foreground)", /* white */
        },
        popover: {
          DEFAULT: "var(--color-popover)", /* gray-700 */
          foreground: "var(--color-popover-foreground)", /* gray-50 */
        },
        card: {
          DEFAULT: "var(--color-card)", /* gray-700 */
          foreground: "var(--color-card-foreground)", /* gray-50 */
        },
        success: {
          DEFAULT: "var(--color-success)", /* green-400 */
          foreground: "var(--color-success-foreground)", /* white */
        },
        warning: {
          DEFAULT: "var(--color-warning)", /* orange-400 */
          foreground: "var(--color-warning-foreground)", /* white */
        },
        error: {
          DEFAULT: "var(--color-error)", /* red-400 */
          foreground: "var(--color-error-foreground)", /* white */
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'ease-out',
        'layout': 'ease-in-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}