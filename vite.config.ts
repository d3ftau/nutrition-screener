import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves a project repo at /<repo-name>/, not the domain
// root -- base must match so built asset URLs resolve.
export default defineConfig({
  base: '/nutrition-screener/',
  plugins: [react()],
})
