import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production is served via `vite preview`, which by default lets browsers
// cache index.html the same way as any other static file. Since index.html
// is what references the content-hashed JS/CSS bundle, a cached index.html
// keeps pointing at a deployed-over/removed old bundle after every release
// until the user hard-refreshes. Force index.html (and any SPA route, which
// falls back to it) to always revalidate, while letting the hashed
// /assets/* files cache forever (safe, since their filename changes when
// their content does).
function cacheControlPlugin() {
  return {
    name: 'cache-control',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        } else {
          res.setHeader('Cache-Control', 'no-cache')
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), cacheControlPlugin()],
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    allowedHosts: ['www.consultoriajas.com', 'consultoriajas.com']
  }
})