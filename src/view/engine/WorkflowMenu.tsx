import React, {useEffect, useRef, useState} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import {DragOutlined, PushpinOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import CodeDiffViewer from "@/components/editor/CodeDiffViewer.tsx";
import {Button, message, Modal, notification, NotificationArgsProps, Popconfirm} from 'antd';
import CircleDotWithLabel from "@/view/engine/CircleDotWithLabel.tsx";
import {getWorkflowMetadata, updateWorkflow} from "@/network/api.ts";
import {WorkflowMetadata} from "@/components/model/WorkflowModel.ts";
import debug from '@/assets/logo/debug.svg';
import update from '@/assets/logo/update.svg';
import close from '@/assets/logo/close.svg';
import can from '@/assets/logo/can.svg';

import vs from '@/assets/logo/vs.svg';

import DebugForm from "@/view/engine/DebugForm.tsx";
import Draggable, {DraggableData, DraggableEvent} from "react-draggable";

type NotificationPlacement = NotificationArgsProps['placement'];

interface BubbleRef {
    offsetX: number;
    offsetY: number;
}

interface DraggableBubbleProps {
    treeChartState: TreeChartState;
}

interface LineContent {
    content: string;
    label: string;
}


const calculateInitialPosition = () => {
    // 视口宽度减去气泡宽度和边距，得到 x 坐标
    const x: number = 40; // 左下角意味着 x 值较小，这里设置为左边距
    // 视口高度减去气泡高度和边距，得到 y 坐标
    const y = window.innerHeight - 120;

    return {x, y};
};

const WorkflowMenu: React.FC<DraggableBubbleProps> = ({treeChartState}) => {

    const [api, contextHolder] = notification.useNotification();
    const [messageApi, messageContextHolder] = message.useMessage();

    const [bubblePosition, setBubblePosition] = useState(calculateInitialPosition());
    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef<BubbleRef | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDebugVisible, setIsDebugVisible] = useState(false);
    const [compareLines, setCompareLines] = useState<LineContent[] | null>(null);
    const [isCompareModalVisible, setIsCompareModalVisible] = useState(false);
    const [rotated, setRotated] = useState(false);

    const [workflowMetadata, setWorkflowMetadata] = useState<WorkflowMetadata | null>(null);
    const handleClick = () => {
        setRotated(!rotated); // 切换状态
    };
    const showModal = async () => {

        setWorkflowMetadata(await getWorkflowMetadata(treeChartState.currentData.workflowId));
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };


    const handleDebugWorkflow = () => {
        setIsDebugVisible(true);
    }
    const handleDetailCancel = () => {
        setCompareLines(null);
        setIsCompareModalVisible(false);
    };
    const handleDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // if (expandedContentRef.current && e.target instanceof Node) {
        //     if (expandedContentRef.current.contains(e.target)) {
        //         // 如果点击的是 expandedContent 内部或其自身，不执行拖动逻辑
        //         // message.success('xiaoyu');
        //         return;
        //     }
        // }
        if (rotated) {
            return;
        }

        setIsDragging(true);
        treeChartState.treeStore.setCurrentMenu(null);

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
    const clean = () => {
        setCompareLines([]);
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
            btn: (<div>
                <Button
                    type="primary"
                    onClick={handleCompare}
                    disabled={compareLines == null || compareLines.length < 2} // 当 compareLines.length 小于 2 时禁用按钮
                    style={{marginRight: 8}}
                >
                    开始对比
                </Button>
                <Button
                    onClick={clean} // 这里调用一个函数来清空compareLines并关闭通知
                >
                    清空
                </Button>
            </div>),
            duration: null,
            placement: 'top' as NotificationPlacement,
            onClose: resetNotification,
        });
    };

    const handleLineClick = (lineContent: string) => {
        const scriptTextIndex = lineContent.indexOf("scriptText\":");
        if (scriptTextIndex === -1) {
            message.success('只对比代码部分').then(r => r);
            return;
        }

        // 提取 label 和 code
        const label = lineContent.substring(scriptTextIndex + 12, scriptTextIndex + 162); // 获取 scriptText 后面的内容作为 label
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
            const maxX = isExpanded ? (divBounds.right - 1200) : (divBounds.right - 470);
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
        // 检查是否已固定（即 rotated 为 true）
        if (rotated) {
            message.success('请先取消固定').then(r => r);
            return;
        }

        // 如果未固定，切换展开状态
        setIsExpanded(!isExpanded);
    };

    const handleWorkflowUpdate = () => {

        messageApi.open({
            key: 'loading',
            type: 'loading',
            content: 'Loading...',
        });

        setTimeout(() => {
            updateWorkflow(treeChartState.currentData).then(r => {
                if (r) {
                    messageApi.open({
                        key: 'loading',
                        type: 'success',
                        content: '更新成功!',
                        duration: 2,
                    });
                } else {
                    messageApi.open({
                        key: 'loading',
                        type: 'error',
                        content: '更新失败!',
                        duration: 2,
                    });
                }
            });
        }, 500);


    }


    useEffect(() => {
        // 当窗口大小变化时，更新气泡的位置
        const handleResize = () => {
            setBubblePosition(calculateInitialPosition());
        };

        window.addEventListener('resize', handleResize);

        // 组件卸载时清理事件监听器
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
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


    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({left: 0, top: 0, bottom: 0, right: 0});
    const draggleRef = useRef<HTMLDivElement>(null);

    const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
        const {clientWidth, clientHeight} = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };


    const confirm = () => {
        window.open('https://github.com/code-visual/visual-flowengine-spring-boot-starter', '_blank');
    };

    return (
        <> {contextHolder}
            {messageContextHolder}
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
                        <div onClick={handleDebugWorkflow} className={styles.icon}>
                            <img src={debug} alt="icon" style={{width: '30px', height: '30px'}}/>
                        </div>
                        <div onClick={handleWorkflowUpdate} className={styles.icon}>
                            <img src={update} alt="icon" style={{width: '42px', height: '42px'}}/>
                        </div>
                        <div onClick={showModal} className={styles.icon}>
                            <img src={vs} alt="icon" style={{width: '30px', height: '30px'}}/>
                        </div>


                        <Popconfirm
                            title="前往GitHub查看官方文档？"
                            icon={<QuestionCircleOutlined style={{color: '#7cb25d'}}/>}
                            onConfirm={confirm}
                            okText="Yes"
                            cancelText="No"
                            style={{
                                marginBottom: '110px',
                                paddingBottom: '110px',
                                position: 'absolute',
                                left: '0px',
                                top: '0px'
                            }}
                        >
                            <div style={{padding: '12px'}}>
                                <div className={styles.icon}>
                                    <img src={can} alt="icon" style={{width: '30px', height: '30px'}}/>
                                </div>
                            </div>
                        </Popconfirm>


                        <div onClick={toggleExpand} className={styles.icon}>
                            <img src={close} alt="icon" style={{width: '30px', height: '30px'}}/>
                        </div>


                    </div>
                    : "菜单"}

            </div>
            <PushpinOutlined onClick={handleClick} className={styles.fixedIcon} style={{
                display: isExpanded ? 'block' : 'none',
                position: 'absolute',
                cursor: 'grab',
                left: `${bubblePosition.x + 778}px`,
                top: `${bubblePosition.y - 5}px`,
                transform: rotated ? 'rotate(-45deg)' : 'none', // 根据状态旋转图标
                transition: 'transform 0.3s' // 平滑过渡效果
            }}/>
            {!rotated && <DragOutlined className={styles.dragIcon} onMouseDown={handleDragStart}

                                       style={{
                                           transition: isDragging ? 'none' : 'all 0.3s ease',
                                           position: 'absolute',
                                           cursor: 'grab',
                                           left: `${isExpanded ? bubblePosition.x - 2 : bubblePosition.x + 22}px`,
                                           top: `${isExpanded ? bubblePosition.y - 5 : bubblePosition.y - 15}px`,
                                       }}/>
            }

            <Modal
                title="初始代码   VS   当前代码"
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
                    originalCode={JSON.stringify(workflowMetadata == null ? '' : workflowMetadata.scriptMetadata, null, 2)}
                    modifiedCode={JSON.stringify(treeChartState.currentData.scriptMetadata, null, 2)}/>
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

            <Modal
                title={<div style={{
                    width: '100%',
                    cursor: 'move',
                }}
                            onMouseOver={() => {
                                if (disabled) {
                                    setDisabled(false);
                                }
                            }}
                            onMouseOut={() => {
                                setDisabled(true);
                            }}>Debug Workflow
                </div>}
                open={isDebugVisible}
                centered
                onCancel={() => {
                    setIsDebugVisible(false)
                }}
                maskClosable={false}
                footer={null}
                width={1000}
                style={{height: '80vh'}}
                modalRender={(modal) => (
                    <Draggable
                        disabled={disabled}
                        bounds={bounds}
                        nodeRef={draggleRef}
                        onStart={(event, uiData) => onStart(event, uiData)}
                    >
                        <div ref={draggleRef}>{modal}</div>
                    </Draggable>
                )}
            >
                <DebugForm treeChartState={treeChartState}/>

            </Modal>


        </>

    );
};

export default WorkflowMenu;
