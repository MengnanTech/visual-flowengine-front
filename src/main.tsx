import ReactDOM from 'react-dom/client'
//样式初始化一般放在最前面
import "reset-css"
//UI框架样式

import "@/assets/styles/global.scss"
//组件样式
import App from './App.tsx'
import {HashRouter} from "react-router-dom"

ReactDOM.createRoot(document.getElementById('root')!).render(
    <HashRouter>
        <App/>
    </HashRouter>
)
