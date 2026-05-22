import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function logApiProxyTarget(target) {
  return {
    name: 'log-api-proxy-target',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        // eslint-disable-next-line no-console
        console.log(`\n  \x1b[36m[vite]\x1b[0m proxy  /api  →  ${target}\n`)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget =
    env.VITE_DEV_PROXY_TARGET?.trim() ||
    env.VITE_API_BASE_URL?.trim() ||
    'https://api.shikkhasomoy.com'

  return {
    plugins: [react(), logApiProxyTarget(apiProxyTarget)],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          configure(proxy) {
            proxy.on('error', (err) => {
              // eslint-disable-next-line no-console
              console.error(`[vite proxy /api → ${apiProxyTarget}]`, err.message)
            })
          },
        },
      },
    },
  }
})
