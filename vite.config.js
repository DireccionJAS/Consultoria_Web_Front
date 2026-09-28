import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'compression'

// Production is served via `vite preview`, which is a bare static server:
// no response compression and none of the standard security headers.
function prodServerPlugin() {
  return {
    name: 'prod-server-headers',
    configurePreviewServer(server) {
      // gzip/brotli-negotiated compression -- vite preview sends every
      // response (including the 1MB+ JS bundle) uncompressed otherwise.
      server.middlewares.use(compression())

      server.middlewares.use((req, res, next) => {
        // index.html (and any SPA route, which falls back to it) is what
        // references the content-hashed JS/CSS bundle -- if the browser
        // caches it, it keeps pointing at a deployed-over/removed old
        // bundle after every release until a hard refresh. Force it to
        // always revalidate, while letting the hashed /assets/* files
        // cache forever (safe, since their filename changes when their
        // content does).
        if (req.url.startsWith('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        } else {
          res.setHeader('Cache-Control', 'no-cache')
        }

        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), prodServerPlugin()],
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    allowedHosts: ['www.consultoriajas.com', 'consultoriajas.com']
  }
})