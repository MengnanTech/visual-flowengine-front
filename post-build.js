import {promises as fs} from 'fs';
import {resolve} from 'path';

// 异步函数来处理文件
async function updateIndexHtml() {
    const indexPath = resolve('dist', 'index.html');

    try {
        // 读取 index.html 文件
        let html = await fs.readFile(indexPath, 'utf-8');

        // 删除所有硬编码的API路径
        html = html.replace(/window\.\w+ApiPath\s*=\s*".*?";\s*\n?/g, '');


        // // 解开注释的Thymeleaf变量
        html = html.replace(/\/\/\s*(window\.\w+ApiPath = \[\[\$\{.*?\}\]\];)/g, '$1');


        // 替换 JavaScript 文件路径为 Thymeleaf 动态路径
        html = html.replace(
            /src="\/assets\/(.*?)\.js"/g,
            `th:src="\${visualFlowProperties.getResourcePath('/assets/$1.js')}"`
        );

// 替换 CSS 文件路径为 Thymeleaf 动态路径
        html = html.replace(
            /href="\/assets\/(.*?)\.css"/g,
            `th:href="\${visualFlowProperties.getResourcePath('/assets/$1.css')}"`
        );

// 替换 modulepreload 的 JavaScript 资源路径为 Thymeleaf 动态路径
        html = html.replace(
            /<link rel="modulepreload" crossorigin href="\/assets\/(.*?)\.js">/g,
            `<link rel="modulepreload" crossorigin th:href="\${visualFlowProperties.getResourcePath('/assets/$1.js')}">`
        );

// 替换 stylesheet 的 CSS 资源路径为 Thymeleaf 动态路径
        html = html.replace(
            /<link rel="stylesheet" crossorigin href="\/assets\/(.*?)\.css">/g,
            `<link rel="stylesheet" crossorigin th:href="\${visualFlowProperties.getResourcePath('/assets/$1.css')}">`
        );


        // 写回修改后的内容
        await fs.writeFile(indexPath, html, 'utf-8');
    } catch (err) {
        console.error('Error updating index.html:', err);
    }
}

// 执行更新函数
updateIndexHtml();
