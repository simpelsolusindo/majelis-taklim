import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Majelis Ta'lim Perum The Cemandi",
        short_name: "Majelis Ta'lim",
        description: "Sistem Manajemen Jamaah & Kegiatan Majelis Ta'lim Perum The Cemandi",
        theme_color: '#059669',
        background_color: '#f0fdf4',
        display: 'standalone',
        start_url: '/',
        lang: 'id',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    chunkSizeWarningLimit: 700,
  }
})