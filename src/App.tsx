// import { useState } from 'react'
import {useRoutes} from "react-router-dom"
import React, {lazy} from "react";

function App() {


    const WorkflowArrange = lazy(() => import("./view/engine/workflow/arrange/Arrange.tsx"));

    const withSuspense = (e: React.JSX.Element) => {
        return (
            <React.Suspense fallback={<div>loading...</div>}>
                {e}
            </React.Suspense>
        )
    }
    const outlet = useRoutes([
        {
            //你希望登陆进去首次进去看到的页面，这里是重定向
            path: "",
            element: withSuspense(<WorkflowArrange/>)
        }
    ]);

    return (

        <div>
            {outlet}
        </div>


    )
}

export default App
