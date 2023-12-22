import {Menu} from 'antd';
import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {MenuItem, menuItems} from "../../config/menu.ts";



const MainMenu: React.FC = () => {


    useEffect(() => {
        // const  id  = localStorage.getItem(accessToken)
        // // 获取菜单列表
        // getMenus(id).then((res) => {
        //     setMenus(res.data.menus)
        // })
    }, [])

    const navigateTo = useNavigate();
    const currentRoute = useLocation()


    const findAllParentKeys = (items: MenuItem[], targetKey: string, currentPath: string[] = []): string[] => {
        for (const item of items) {
            const newPath = [...currentPath, item.key];
            if (item.key === targetKey) {
                return newPath;
            }
            if (item.children) {
                const foundParentKeys = findAllParentKeys(item.children, targetKey, newPath);
                if (foundParentKeys?.length != 0) {
                    return foundParentKeys;
                }
            }
        }
        return [];
    };

    const [openKeys, setOpenKeys] = useState(() => {
        return findAllParentKeys(menuItems, currentRoute.pathname);
    });

    const menuClick = (e: { key: string }) => {
        navigateTo(e.key)
        setOpenKeys(findAllParentKeys(menuItems, e.key))
    }

    const handleOpenChange = (keys: string[]) => {
        if (keys.length > openKeys.length) {
            setOpenKeys(findAllParentKeys(menuItems, keys[keys.length - 1]))
        } else {
            const closedKey = openKeys.find(k => !keys.includes(k));
            if (closedKey) {
                const index = openKeys.indexOf(closedKey);
                setOpenKeys(prevKeys => prevKeys.slice(0, index));
            }
        }
    }
    return (
        <>
            <Menu
                mode="inline"
                defaultOpenKeys={[currentRoute.pathname]}
                items={menuItems}
                onClick={menuClick}
                onOpenChange={handleOpenChange}
                openKeys={openKeys}
                inlineIndent={16}
            />
        </>
    )

}
export default MainMenu;
