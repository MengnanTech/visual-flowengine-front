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



        // 写回修改后的内容
        await fs.writeFile(indexPath, html, 'utf-8');
    } catch (err) {
        console.error('Error updating index.html:', err);
    }
}

// 执行更新函数
updateIndexHtml();
