import ReactDOM from 'react-dom/client'
//样式初始化一般放在最前面
import "reset-css"
//UI框架样式
import "@/assets/styles/global.scss"
import Arrange from "@/view/engine/ArrangeIndex.tsx";
import {loader} from "@monaco-editor/react";
// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

import 'monaco-editor/esm/vs/language/json/monaco.contribution'

import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'



self.MonacoEnvironment = {
    // @ts-ignore
    getWorker: function (_: any, label: string) {

        console.log("label", label)
        if (label === 'json') {
            return new jsonWorker()
        }
        //editorWorkerService
        // 如果默认的worker diff 的小红点会失效。
        // return new editorWorker()
    },
}


loader.config({ monaco });
ReactDOM.createRoot(document.getElementById('root')!).render(
    <Arrange/>
)
