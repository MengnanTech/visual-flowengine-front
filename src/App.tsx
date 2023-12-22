// import { useState } from 'react'
import {useRoutes} from "react-router-dom"
import {AdminRouter} from "./router/routers.tsx";

function App() {
    const outlet = useRoutes(AdminRouter);

    return (

        <div >
            {outlet}
        </div>


    )
}

export default App
