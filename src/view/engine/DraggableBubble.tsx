import React, {useEffect, useRef, useState} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import {DragOutlined, SmileOutlined} from "@ant-design/icons";
import Icon2 from '@/assets/logo/321.svg';
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import CodeDiffViewer from "@/components/editor/CodeDiffViewer.tsx";
import {Button, message, Modal, notification} from "antd";

import type { NotificationArgsProps } from 'antd';
import CircleDot from "@/view/engine/CircleDot.tsx";

type NotificationPlacement = NotificationArgsProps['placement'];
interface BubbleRef {
    offsetX: number;
    offsetY: number;
}

interface DraggableBubbleProps {
    treeChartState: TreeChartState;
    treeStore: TreeStore;
}

const DraggableBubble: React.FC<DraggableBubbleProps> = ({treeChartState, treeStore}) => {

    const [api, contextHolder] = notification.useNotification();
    const [bubblePosition, setBubblePosition] = useState({x: 100, y: 100});
    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef<BubbleRef | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    // const [clickCount, setClickCount] = useState(0);
    // const [compareReady, setCompareReady] = useState(false);
    // const [clickCount, setClickCount] = useState(0);
    const [compareLines, setCompareLines] = useState<string[]>([]);
    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const handleDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsDragging(true);
        treeStore.setCurrentMenu(null);

        e.preventDefault();
        bubbleRef.current = {
            offsetX: e.clientX - bubblePosition.x,
            offsetY: e.clientY - bubblePosition.y,
        };
    };
    const handleOnRemove = (index:number) => {
        const newCompareLines = compareLines.filter((_, i) => i !== index);
        setCompareLines(newCompareLines);
        // updateNotification(newCompareLines); // 更新通知以反映新的compareLines数组
    };
    const handleCompare = () => {
        // 关闭通知
        api.destroy("compareNotification")
        // 执行对比逻辑，例如打开模态框
    };

    const updateNotification = (compareLines:string[]) => {
        console.log('updateNotification compareLines', compareLines);
        api.open({
            key: 'compareNotification',
            message: '点击红点对比代码',
            description: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    {compareLines.map((k, index) => (

                        <CircleDot
                            key={index}
                            color={'green'}
                            onRemove={() => handleOnRemove(index)}
                        />
                    ))}
                </div>
            ),
            style: {
                width: 290,
            },
            btn: (
                <Button
                    type="primary"
                    onClick={handleCompare}
                    disabled={compareLines.length < 2} // 当 compareLines.length 小于 2 时禁用按钮
                >
                    开始对比
                </Button>),
            duration: null,
            placement: 'top' as NotificationPlacement,
            onClose: resetNotification,
        });
    };
    const resetNotification = () => {
        setCompareLines([]); // 清空已选择行的数组
    };

    const handleLineClick = (lineContent: string) => {
        if (lineContent.includes("scriptText") && compareLines.length < 2) {
            setCompareLines(prevLines => {
                const updatedLines = [...prevLines, lineContent];
                if (updatedLines.length > 2) return prevLines; // 保证最多只有两行
                return updatedLines;
            });
        }
    };
    useEffect(() => {
        if (compareLines.length > 0) {
            updateNotification(compareLines);
        }
    }, [compareLines]);


    const handleDragMove = (e: MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - bubbleRef.current!.offsetX;
            const newY = e.clientY - bubbleRef.current!.offsetY;

            // 获取div的边界
            const divBounds = treeChartState.svgRef.getBoundingClientRect();
            console.log('divBounds', divBounds);

            // 计算边界条件
            const minX = divBounds.left - 310;
            const maxX = divBounds.right - 470;
            const minY = divBounds.top + 10;
            const maxY = divBounds.bottom + 230;

            // 限制在div内部移动
            const clampedX = Math.max(Math.min(newX, maxX), minX);
            const clampedY = Math.max(Math.min(newY, maxY), minY);

            setBubblePosition({x: clampedX, y: clampedY});
        }
    };


    const handleDragEnd = () => {
        setIsDragging(false);
    };
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        // 这里可以添加动画效果的逻辑
    };
    useEffect(() => {
        console.log('DraggableBubble useEffect isDragging');
        if (isDragging) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        } else {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);
    return (
        <> {contextHolder}
            <div
                style={{
                    left: `${bubblePosition.x}px`,
                    top: `${bubblePosition.y}px`,
                    transition: isDragging ? 'none' : 'all 0.5s ease',

                }}
                onClick={() => {
                    if (!isExpanded) toggleExpand();
                }}
                className={isExpanded ? styles.expanded : styles.bubble}
                onMouseDown={handleDragStart}
            >
                {isExpanded ? <div className={styles.expandedContent}>

                        <div className={styles.icon}>
                            调试
                        </div>
                        <div onClick={toggleExpand} className={styles.icon}>
                            <img src={Icon2} alt="icon" style={{width: '42px', height: '42px'}}/>
                        </div>
                        <div className={styles.icon}>
                            更新代码
                        </div>
                        <div onClick={showModal} className={`${styles.icon} ${styles.iconMove1}`}>
                            代码对比
                        </div>
                        <div className={styles.icon}>
                            Review Standard
                        </div>
                        <div className={styles.icon}>
                            6
                        </div>
                    </div>

                    : "菜单"}

            </div>
            <DragOutlined className={styles.dragIcon} onMouseDown={handleDragStart}

                          style={{
                              transition: isDragging ? 'none' : 'all 0.3s ease',
                              position: 'absolute',
                              cursor: 'grab',
                              left: `${isExpanded ? bubblePosition.x - 2 : bubblePosition.x + 20}px`,
                              top: `${isExpanded ? bubblePosition.y - 5 : bubblePosition.y - 15}px`,
                          }}/>

            <Modal
                title="初始代码对比当前代码"
                open={isModalVisible}
                centered
                onCancel={handleCancel}
                maskClosable={false}
                footer={null}
                width={"90vw"}
                style={{maxWidth: '92vw', maxHeight: '100vh', overflow: 'hidden'}}
            >
                <CodeDiffViewer
                    language='groovy'
                    onLineClick={handleLineClick}
                    originalCode={JSON.stringify(treeStore.treeData,null, 2)}
                    modifiedCode={JSON.stringify(treeChartState.rootNode!.data,null, 2)}/>
            </Modal>


        </>

    );
};

export default DraggableBubble;
