import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// On GitHub Pages (project sites), the app is served from /<repo>/, so the base
// must match. GitHub Actions sets GITHUB_REPOSITORY to "owner/repo". For local
// dev (no such env var) this falls back to "/". Override with GITHUB_PAGES_BASE
// when serving from a custom domain or a user/org site (username.github.io).
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_PAGES_BASE ?? (repo ? `/${repo}/` : '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Journal',
        short_name: 'Journal',
        description: 'A local-first journal',
        theme_color: '#16171d',
        background_color: '#f6f4ef',
        display: 'standalone',
        start_url: base,
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
