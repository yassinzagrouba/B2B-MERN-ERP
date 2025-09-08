// This is a workaround for ESM compatibility issues with PostCSS
// https://vitejs.dev/guide/migration-from-v4.html#postcss-config-file

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
