import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({mode}) => ({

    plugins: [
        react(),
    ],
    resolve: {
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.sass', '.scss'], // 忽略输入的扩展名
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true
            }
        }

    },
    server: {
        proxy: {
            '/api/': {
                target: 'https://ikuning.com/',
                changeOrigin: true,
                rewrite: (path: string) => path.replace('^/', '')
            }
        }
    },

}))
