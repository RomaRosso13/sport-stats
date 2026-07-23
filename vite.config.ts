import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // Sin esto, el manifest y el service worker (de los que depende el
      // botón "Instalar app") solo existen en el build de producción, no en
      // `npm run dev` — sirve únicamente para poder probarlo en local.
      devOptions: {
        enabled: true,
      },
      // Solo precachea el shell de la app (JS/CSS/HTML/íconos). Las llamadas
      // a Supabase pasan de largo del service worker: cachearlas arriesgaría
      // mostrar resultados/estadísticas desactualizados sin que el usuario
      // se dé cuenta de que está viendo datos viejos.
      manifest: {
        name: 'FlagStats',
        short_name: 'FlagStats',
        description: 'Calendario, resultados, tabla de posiciones y estadísticas de tu liga de flag football.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#e6007e',
        lang: 'es-MX',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
