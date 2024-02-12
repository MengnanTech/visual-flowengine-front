import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {visualizer} from "rollup-plugin-visualizer";

export default defineConfig(({mode}) => ({

    plugins: [
        react(),
        visualizer({
            gzipSize: true,
            brotliSize: true,
            emitFile: false,
            filename: "test.html", //分析图生成的文件名
            open:true //如果存在本地服务端口，将在打包后自动展示
        } ) as any,

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
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://8.137.20.123:8001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
}))
