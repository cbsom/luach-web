import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon.png', 'Luach.ico'],
      manifest: {
        name: 'Luach - Jewish Calendar',
        short_name: 'Luach',
        description: 'A modern, elegant Jewish calendar with zmanim, holidays, and reminders.',
        theme_color: '#1a0f0a',
        background_color: '#1a0f0a',
        display: 'standalone',
        icons: [
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: './',
})
