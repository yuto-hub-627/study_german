import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Deutsch lernen – ドイツ語学習',
        short_name: 'Deutsch',
        description: '教科書準拠のドイツ語単語・文法学習アプリ',
        lang: 'ja',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f4ecdc',
        theme_color: '#f4ecdc',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}', 'assets/*latin-400-normal*.woff2', 'assets/*latin-600-normal*.woff2'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // 日本語手書きフォント (文字範囲ごとに分割) は使った分だけキャッシュ
            urlPattern: ({ url }) => url.pathname.endsWith('.woff2'),
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 300 } },
          },
          {
            // 予測入力用の辞書 (約4.6MB) は初回利用時にキャッシュ
            urlPattern: ({ url }) => url.pathname.startsWith('/dict/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'dict', expiration: { maxEntries: 4 } },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: { '/api': 'http://localhost:8787' },
  },
});
