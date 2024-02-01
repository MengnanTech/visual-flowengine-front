import ReactDOM from 'react-dom/client'
//样式初始化一般放在最前面
import "reset-css"
//UI框架样式
import "@/assets/styles/global.scss"
import Arrange from "@/view/engine/ArrangeIndex.tsx";
import {loader} from "@monaco-editor/react";
loader.config({
    paths: {
        vs: 'src/components/editor/vs'
    }
});
ReactDOM.createRoot(document.getElementById('root')!).render(
    <Arrange/>
)
