import fs from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],

    build: {
        outDir: 'public/build',
        manifest: 'manifest.json',
        rollupOptions: {
            input: 'resources/js/app.jsx',
        },
    },
    server: {
        host: '127.0.0.1',
        https: {
            key: fs.readFileSync('./localhost+1-key.pem'),
            cert: fs.readFileSync('./localhost+1.pem'),
        },
        proxy: {
            '/api': 'http://127.0.0.1:8000'
        }
    }
})