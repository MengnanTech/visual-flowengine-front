import React, {useEffect, useRef, useState} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import {DragOutlined} from "@ant-design/icons";
import Icon2 from '@/assets/logo/321.svg';
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import CodeDiffViewer from "@/components/editor/CodeDiffViewer.tsx";
import {Modal} from "antd";
interface BubbleRef {
    offsetX: number;
    offsetY: number;
}

interface DraggableBubbleProps {
    treeChartState: TreeChartState;
    treeStore: TreeStore;
}

const DraggableBubble: React.FC<DraggableBubbleProps> = ({treeChartState, treeStore}) => {
    console.log('DraggableBubble');
    const [bubblePosition, setBubblePosition] = useState({x: 100, y: 100});
    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef<BubbleRef | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

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
        <>
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
                <CodeDiffViewer originalCode={JSON.stringify(treeStore.treeData,null, 2)} modifiedCode={JSON.stringify(treeChartState.rootNode!.data,null, 2)}/>
            </Modal>

        </>

    );
};

export default DraggableBubble;
