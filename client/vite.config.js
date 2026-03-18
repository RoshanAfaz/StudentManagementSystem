import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'Achievers Academy Student Manager',
                short_name: 'Achievers',
                description: 'Student Management System for Achievers Academy',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: 'vite.svg',
                        sizes: '192x192 512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    }
})
