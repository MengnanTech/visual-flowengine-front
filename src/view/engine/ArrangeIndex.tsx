import React, {useEffect, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {Collapse, message} from 'antd';
import {SettingOutlined} from '@ant-design/icons';
import TreeChart from './TreeChart';
import {TreeStore} from '@/store/TreeStore';
import {NodeData} from '@/components/D3Node/NodeModel';
import styles from './styles/ArrangeIndex.module.scss';
import {collapseItems, initialData, initialData2,} from '@/components/d3Helpers/D3mock.tsx';

// import logo from 'src/assets/logo/logo.jpeg'; // 您的logo路径

interface MenuItem {
    key: string;
    label: string;
}

const ArrangeIndex: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [treeData, setTreeData] = useState<NodeData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [treeChartKey, setTreeChartKey] = useState<number>(0);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuDataItem | null>(
        null
    );
    // const [isEnlarged, setIsEnlarged] = useState(false);
    // const handleButtonClick = () => {
    //     setIsEnlarged(!isEnlarged);
    // };

    useEffect(() => {
        // Fetch menu items when the component mounts
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                // const response = await fetch('/api/menu-items'); // Replace with your actual API endpoint
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                // const data: MenuItem[] = await response.json();
                const mockMenuItems: MenuItem[] = [
                    {
                        key: '1',
                        label: 'it.task-service.flow.custReminderGeneration',
                    },
                    {
                        key: '2',
                        label: 'reminderEventHandler',
                    },
                ];

                setMenuItems(mockMenuItems);
            } catch (err: any) {
                message.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems().then((r) => r);
    }, []);

    const handleMenuClick = async (e: MenuDataItem) => {
        if (e.key === undefined) {
            // 处理 key 为 undefined 的情况
            message.error('Menu item key is undefined');
            return; // 直接返回，不执行后续逻辑
        }
        setSelectedMenuItem(e);
        setTreeChartKey((prevKey) => prevKey + 1);
        try {
            setLoading(true);
            // const response = await fetch(`/api/tree-data/${e.key}`); // Replace with your actual API endpoint
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            // const data: NodeData = await response.json();
            interface MockApiDataType {
                [key: string]: NodeData; // 定义索引签名
            }

            const mockApiData: MockApiDataType = {
                '1': {...initialData},
                '2': {...initialData2},
                // ...其他数据
            };
            const newData = mockApiData[e.key];

            setTreeData(newData);
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    const menuData = menuItems.map((item) => ({
        key: item.key,
        name: item.label,
        // icon: <EnvironmentOutlined/>, // 假设每个菜单项都使用这个图标
        path: `/${item.key}`,
    }));

    return (
        <ProLayout
            logo={'src/assets/logo/logo.jpeg'}
            title="可视化流程引擎"
            menuItemRender={(item, dom) => (
                <div className={styles.menuItemContainer} onClick={() => handleMenuClick(item)}>
                    {dom}
                    <div className={styles.menuIcons}>
                        <SettingOutlined/>
                    </div>
                </div>
            )
            }
            actionsRender={
                () => [
                    <div className={styles.maskDiv}>
                        <button
                            key="1"
                            // className={`${styles.circleButton} ${isEnlarged ? 'enlarged' : ''}`}
                            className={styles.circleButton}
                            // onClick={handleButtonClick}
                        >
                            +
                        </button>
                    </div>
                ]}
            avatarProps={{
                src: 'src/assets/logo/logo.jpeg', // 您的头像图片路径
                size: 'large',
                // 如果您想要头像点击事件:
                onClick: () => {
                    message.info('Avatar clicked').then((r) => r);
                },
            }}
            menuDataRender={() => menuData}
            onMenuHeaderClick={() => {
                message.info('菜单头部被点击').then((r) => r);
            }}
            onPageChange={() => {
                // 页面变化时，如清除选中的菜单项
            }}
        >
            <PageContainer
                title={
                    selectedMenuItem && (
                        <Collapse bordered={false} items={collapseItems}/>
                    )
                }
            >
                {/* 页面内容 */}
                {selectedMenuItem && treeData && (
                    <div className={styles.treeChartContainer}>
                        <TreeChart
                            key={treeChartKey}
                            treeStore={new TreeStore()}
                            initialData={treeData}
                        />
                    </div>
                )}
                {!selectedMenuItem && <div>请选择左侧列表中的一个节点查看详情。</div>}
            </PageContainer>
        </ProLayout>
    );
};

export default ArrangeIndex;
