import ReactDOM from 'react-dom/client'
//样式初始化一般放在最前面
import "reset-css"
//UI框架样式
import "@/assets/styles/global.scss"
import Arrange from "@/view/engine/ArrangeIndex.tsx";
import {loader} from "@monaco-editor/react";
// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
//json语法的按需导入
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

import "monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController"
import  "monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestInlineCompletions"

// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'


/**
 * 按需导入很多特性都会消失。甚至右键都没有了。一个一个的去对应的特性文件有点麻烦 目前就全部导入吧，虽然打包体积比较大。达到了3M。代码先保留。
 * node_modules/monaco-editor/esm/metadata.js 这是清单文件
 */

self.MonacoEnvironment = {
    // @ts-ignore
    getWorker: function (_: any, label: string) {

        if (label === 'json') {
            return new jsonWorker()
        }
        //editorWorkerService
        // 如果默认的worker diff 的小红点会失效。
        // return new editorWorker()
    },
}


loader.config({monaco});
ReactDOM.createRoot(document.getElementById('root')!).render(
    <Arrange/>
)
