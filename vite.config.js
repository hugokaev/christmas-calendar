import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is the folder the site is served from.
//
// Vercel serves it from the root of a domain, so this is '/'.
// (On GitHub Pages it would need to be '/christmas-calendar/' instead,
// because the site would live in a subfolder of github.io.)
export default defineConfig({
  plugins: [react()],
  base: '/',
})
