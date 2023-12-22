import {AdminRouter, Router} from "../router/routers.tsx";
import React from "react";

export type MenuItem = {
    key: string;
    icon?: React.ReactNode;
    label: string;
    children?: MenuItem[];
};
const transformRouterToMenuItem = (router: Router): MenuItem => {
    const menuItem: MenuItem = {
        key: router.path,
        icon: router.icon,
        label: router.label || ''
    };

    if (router.children) {
        menuItem.children = router.children.map(childRouter => transformRouterToMenuItem(childRouter));
    }

    return menuItem;
}


// 调用该函数来处理AdminRouter的第二个元素的子元素
const menuItems = AdminRouter[2]!.children!.map(childRouter => transformRouterToMenuItem(childRouter))

export {menuItems} ;

