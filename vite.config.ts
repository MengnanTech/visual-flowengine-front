import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {visualizer} from 'rollup-plugin-visualizer';

export default defineConfig({
    plugins: [
        react(),
        visualizer({
            gzipSize: true,
            brotliSize: true,
            emitFile: false,
            filename: 'test.html',
            open: false,
        }) as never,
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('/node_modules/monaco-editor/')) {
                        return 'monaco';
                    }
                },
            },
        },
    },
    resolve: {
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.sass', '.scss'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://8.137.20.123:8001',
                changeOrigin: true,
                rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
            },
        },
    },
});
