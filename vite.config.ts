import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Base relative : fonctionne sur GitHub Pages quel que soit le nom du dépôt.
  base: './',
  plugins: [react(), tailwindcss()],
})
