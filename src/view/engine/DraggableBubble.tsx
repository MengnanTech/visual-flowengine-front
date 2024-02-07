import React, {useEffect, useRef, useState} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import {DragOutlined} from "@ant-design/icons";
import Icon2 from '@/assets/logo/321.svg';
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import CodeDiffViewer from "@/components/editor/CodeDiffViewer.tsx";
import type {NotificationArgsProps} from 'antd';
import {Button, Modal, notification} from "antd";
import CircleDotWithLabel from "@/view/engine/CircleDotWithLabel.tsx";

type NotificationPlacement = NotificationArgsProps['placement'];

interface BubbleRef {
    offsetX: number;
    offsetY: number;
}

interface DraggableBubbleProps {
    treeChartState: TreeChartState;
    treeStore: TreeStore;
}

interface LineContent {
    content: string;
    label: string;
}


const DraggableBubble: React.FC<DraggableBubbleProps> = ({treeChartState, treeStore}) => {

    const [api, contextHolder] = notification.useNotification();
    const [bubblePosition, setBubblePosition] = useState({x: 100, y: 100});
    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef<BubbleRef | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [compareLines, setCompareLines] = useState<LineContent[] | null>(null);
    const [isCompareModalVisible, setIsCompareModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const handleDetailCancel = () => {
        setCompareLines(null);
        setIsCompareModalVisible(false);
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
    const handleOnRemove = (index: number) => {
        setCompareLines(prev => {
            if (!prev || prev.length === 0) return prev;
            const updatedLines = prev.filter((_, i) => i !== index);
            return updatedLines.length > 0 ? updatedLines : [];
        });


    };

    useEffect(() => {
        console.log('useEffect compareLines', compareLines);
        if (compareLines === null) {

        } else {
            // 处理非 null，包括空数组的状态
            updateNotification(compareLines);
        }
    }, [compareLines]);
    const handleCompare = () => {
        api.destroy("compareNotification")
        setIsCompareModalVisible(true);

    };
    const resetNotification = () => {
        api.destroy("compareNotification")
    };
    const updateNotification = (lines: LineContent[]) => {

        api.open({
            key: 'compareNotification',
            message: '点击红点对比代码',
            description: (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
                    {lines.length > 0 ? (
                        <CircleDotWithLabel
                            color="green"
                            label={lines[0].label}
                            onRemove={() => handleOnRemove(0)}
                        />
                    ) : (
                        <CircleDotWithLabel color="grey" label=""/>
                    )}
                    {lines.length > 1 ? (
                        <CircleDotWithLabel
                            color="green"
                            label={lines[1].label}
                            onRemove={() => handleOnRemove(1)}
                        />
                    ) : (
                        <CircleDotWithLabel color="grey" label=""/>
                    )}
                </div>
            ),
            style: {
                width: 290,
            },
            btn: (
                <Button
                    type="primary"
                    onClick={handleCompare}
                    disabled={compareLines == null || compareLines.length < 2} // 当 compareLines.length 小于 2 时禁用按钮
                >
                    开始对比
                </Button>),
            duration: null,
            placement: 'top' as NotificationPlacement,
            onClose: resetNotification,
        });
    };

    const handleLineClick = (lineContent: string) => {
        const scriptTextIndex = lineContent.indexOf("scriptText\":");
        if (scriptTextIndex === -1) {
            return; // 如果行内容不包含 "scriptText"，则不做任何操作
        }

        // 提取 label 和 code
        const label = lineContent.substring(scriptTextIndex + 12, scriptTextIndex + 32); // 获取 scriptText 后面的内容作为 label
        const code = lineContent.substring(scriptTextIndex + 12).trim().replace(/,$/, ''); // 从 "scriptText": 后面开始提取代码，并去除前后空格，并去除尾部逗号

        setCompareLines(prev => {
            const currentLines = prev || []; // 如果 prev 为 null，则使用空数组
            if (currentLines.length >= 2) {
                return [...currentLines];
            }

            const newLine = {content: JSON.parse(code), label}; // 使用提取到的完整code作为content
            return [...currentLines, newLine];
        });
    };




    const handleDragMove = (e: MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - bubbleRef.current!.offsetX;
            const newY = e.clientY - bubbleRef.current!.offsetY;

            // 获取div的边界
            const divBounds = treeChartState.svgRef.getBoundingClientRect();

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
                    originalCode={JSON.stringify(treeStore.treeData, null, 2)}
                    modifiedCode={JSON.stringify(treeChartState.rootNode!.data, null, 2)}/>
            </Modal>
            <Modal
                title="详细代码对比"
                open={isCompareModalVisible}
                centered
                onCancel={handleDetailCancel}
                maskClosable={false}
                footer={null}
                width={"70vw"}
                style={{maxWidth: '92vw', maxHeight: '100vh', overflow: 'hidden'}}
            >
                <CodeDiffViewer
                    language='groovy'
                    originalCode={compareLines && compareLines.length > 0 ? compareLines[0].content : ''}
                    modifiedCode={compareLines && compareLines.length > 1 ? compareLines[1].content : ''}/>
            </Modal>


        </>

    );
};

export default DraggableBubble;
