import React, {lazy} from "react";

import {Navigate} from "react-router-dom";
import Index from "../view/404";
import {EditFilled, HomeFilled, InteractionFilled, SlidersFilled, SmileFilled,} from "@ant-design/icons";

const HomeLayout = lazy(() => import("../view/layout/HomeLayout.tsx"));
const WorkflowIndex = lazy(() => import("../view/engine/workflow/index.tsx"));
const RuleManageIndex = lazy(() => import("../view/engine/workflow/manage/manageIndex.tsx"));
const RuleIndex = lazy(() => import("../view/engine/rule/ruleIndex.tsx"));
const Dashboard = lazy(() => import("../view/dashboard/dashboard.tsx"));


const withSuspense = (e: React.JSX.Element) => {
    return (
        <React.Suspense fallback={<div>loading...</div>}>
            {e}
        </React.Suspense>
    )
}

export type Router = {
    path: string,
    label?: string;
    icon?: React.ReactNode;
    element?: React.JSX.Element,
    children?: Router[]
}


export const AdminRouter: Router[] =
    [
        {
            //你希望登陆进去首次进去看到的页面，这里是重定向
            path: "admin",
            element: <Navigate to="/admin/dashboard"/>
        },
        {
            path: "",
            element: <Navigate to="/admin/dashboard"/>
        },
        {
            //加载布局
            path: "/admin",
            element: <HomeLayout/>,
            children: [
                {
                    path: "/admin/dashboard",
                    label: '面板',
                    icon: <HomeFilled/>,
                    element: withSuspense(<Dashboard/>)
                },
                {
                    path: "/admin/engine/workflow",
                    label: '流程引擎',
                    icon: <InteractionFilled/>,
                    children: [
                        {
                            path: '/admin/engine/workflow/choreography',
                            label: '流程引擎编排',
                            icon: <EditFilled/>,
                            element: withSuspense(<WorkflowIndex/>)
                        },
                        {
                            path: '/admin/engine/workflow/manage',
                            label: '流程引擎管理',
                            icon: <SlidersFilled/>,
                            element: withSuspense(<RuleManageIndex/>)
                        }
                    ]
                },
                {
                    path: "/admin/engine/rule",
                    label: '规则引擎',
                    icon: <SmileFilled/>,
                    element: withSuspense(<RuleIndex/>)
                }
            ]

        },
        {
            path: "*",
            element: withSuspense(<Index/>)
        }

    ];


export const IndexRouter: Router[] =
    [
        {
            path: "",
            element: <Navigate to="/admin/dashboard"/>
        },
        {
            path: "/index",
            element: <Navigate to="/admin/dashboard"/>
        }
    ];