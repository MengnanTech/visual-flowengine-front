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
            open: true //如果存在本地服务端口，将在打包后自动展示
        }) as any,

    ],


    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('/node_modules/monaco-editor/')) {
                        if (id.includes('/esm/vs/platform/')) {
                            return 'monaco-platform';
                        }
                        if (id.includes('/esm/vs/editor/browser')) {
                            return 'monaco-editor-browser';
                        }
                        if (id.includes('/esm/vs/editor/common/core')
                            || id.includes('/esm/vs/editor/common/diff')
                            || id.includes('/esm/vs/editor/common/standalone')
                            || id.includes('/esm/vs/editor/common/services')
                            || id.includes('/esm/vs/editor/common/model')
                            || id.includes('/esm/vs/editor/common/cursor')
                        ) {
                            return 'monaco-editor-common-dir';
                        }

                        if (id.includes('/esm/vs/editor/common')) {
                            return 'monaco-editor-common';
                        }
                        if (id.includes('/esm/vs/base/common/')) {
                            return 'monaco-base-common';
                        }
                        return 'monaco';
                    }
                    if (id.includes('/node_modules/antd/es/')) {
                        return 'antd-es';
                    }
                }

            },
        },
    },

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
