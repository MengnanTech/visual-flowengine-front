import ReactDOM from 'react-dom/client'
//样式初始化一般放在最前面
import "reset-css"
//UI框架样式
import "@/assets/styles/global.scss"
import Arrange from "@/view/engine/ArrangeIndex.tsx";
import {loader} from "@monaco-editor/react";
// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
// loader.config({
//     paths: {
//         vs: 'src/components/editor/vs'
//     }
// });

import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'



self.MonacoEnvironment = {
    // @ts-ignore
    getWorker: function (_: any, label: string) {

        if (label === 'json') {
            return new jsonWorker()
        }
        new editorWorker()
    },
}


loader.config({ monaco });
ReactDOM.createRoot(document.getElementById('root')!).render(
    <Arrange/>
)
