import React, {useEffect, useRef, useState} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import {DragOutlinedIcon, PushpinOutlinedIcon, QuestionCircleOutlinedIcon} from "@/components/ui/icons";
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import CodeDiffViewer from "@/components/editor/CodeDiffViewer.tsx";
import CircleDotWithLabel from "@/view/engine/CircleDotWithLabel.tsx";
import {getWorkflowMetadata, updateWorkflow} from "@/network/api.ts";
import {WorkflowMetadata} from "@/components/model/WorkflowModel.ts";
import debug from '@/assets/logo/debug.svg';
import update from '@/assets/logo/update.svg';
import close from '@/assets/logo/close.svg';
import can from '@/assets/logo/can.svg';
import vs from '@/assets/logo/vs.svg';
import DebugForm from "@/view/engine/DebugForm.tsx";
import CustomModal from "@/components/ui/CustomModal";
import {toast} from "@/components/ui/toast";

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
    const x: number = 40;
    const y = window.innerHeight - 120;
    return {x, y};
};

const WorkflowMenu: React.FC<DraggableBubbleProps> = ({treeChartState}) => {
    // Custom notification state
    const [notificationVisible, setNotificationVisible] = useState(false);

    const [bubblePosition, setBubblePosition] = useState(calculateInitialPosition());
    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef<BubbleRef | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDebugVisible, setIsDebugVisible] = useState(false);
    const [compareLines, setCompareLines] = useState<LineContent[] | null>(null);
    const [isCompareModalVisible, setIsCompareModalVisible] = useState(false);
    const [rotated, setRotated] = useState(false);
    const [confirmGithub, setConfirmGithub] = useState(false);

    const [workflowMetadata, setWorkflowMetadata] = useState<WorkflowMetadata | null>(null);

    const handleClick = () => {
        setRotated(!rotated);
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
    };

    const handleDetailCancel = () => {
        setCompareLines(null);
        setIsCompareModalVisible(false);
    };

    const handleDragStart = (e: React.MouseEvent) => {
        if (rotated) return;
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
        if (compareLines !== null) {
            setNotificationVisible(true);
        }
    }, [compareLines]);

    const handleCompare = () => {
        setNotificationVisible(false);
        setIsCompareModalVisible(true);
    };

    const clean = () => {
        setCompareLines([]);
    };

    const handleLineClick = (lineContent: string) => {
        const scriptTextIndex = lineContent.indexOf("scriptText\":");
        if (scriptTextIndex === -1) {
            toast.success('只对比代码部分');
            return;
        }
        const label = lineContent.substring(scriptTextIndex + 12, scriptTextIndex + 162);
        const code = lineContent.substring(scriptTextIndex + 12).trim().replace(/,$/, '');
        setCompareLines(prev => {
            const currentLines = prev || [];
            if (currentLines.length >= 2) return [...currentLines];
            const newLine = {content: JSON.parse(code), label};
            return [...currentLines, newLine];
        });
    };

    const handleDragMove = (e: MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - bubbleRef.current!.offsetX;
            const newY = e.clientY - bubbleRef.current!.offsetY;
            const divBounds = treeChartState.svgRef.getBoundingClientRect();
            const minX = divBounds.left - 310;
            const maxX = isExpanded ? (divBounds.right - 1200) : (divBounds.right - 470);
            const minY = divBounds.top + 10;
            const maxY = divBounds.bottom + 230;
            const clampedX = Math.max(Math.min(newX, maxX), minX);
            const clampedY = Math.max(Math.min(newY, maxY), minY);
            setBubblePosition({x: clampedX, y: clampedY});
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const toggleExpand = () => {
        if (rotated) {
            toast.success('请先取消固定');
            return;
        }
        setIsExpanded(!isExpanded);
    };

    const handleWorkflowUpdate = () => {
        toast.success('Loading...');
        setTimeout(() => {
            updateWorkflow(treeChartState.currentData).then(r => {
                if (r) {
                    toast.success('更新成功!');
                } else {
                    toast.error('更新失败!');
                }
            });
        }, 500);
    };

    useEffect(() => {
        const handleResize = () => {
            setBubblePosition(calculateInitialPosition());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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

    const confirm = () => {
        window.open('https://github.com/code-visual/visual-flowengine-spring-boot-starter', '_blank');
        setConfirmGithub(false);
    };

    return (
        <>
            {/* Custom notification for code compare */}
            {notificationVisible && compareLines !== null && (
                <div style={{
                    position: 'fixed',
                    top: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1001,
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    padding: '12px 16px',
                    width: 290,
                }}>
                    <div style={{fontWeight: 500, marginBottom: 8}}>点击红点对比代码</div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12}}>
                        {compareLines.length > 0 ? (
                            <CircleDotWithLabel color="green" label={compareLines[0].label} onRemove={() => handleOnRemove(0)}/>
                        ) : (
                            <CircleDotWithLabel color="grey" label=""/>
                        )}
                        {compareLines.length > 1 ? (
                            <CircleDotWithLabel color="green" label={compareLines[1].label} onRemove={() => handleOnRemove(1)}/>
                        ) : (
                            <CircleDotWithLabel color="grey" label=""/>
                        )}
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                        <button
                            onClick={handleCompare}
                            disabled={!compareLines || compareLines.length < 2}
                            style={{
                                padding: '4px 12px',
                                background: (!compareLines || compareLines.length < 2) ? '#d9d9d9' : '#1890ff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: (!compareLines || compareLines.length < 2) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            开始对比
                        </button>
                        <button
                            onClick={clean}
                            style={{padding: '4px 12px', background: '#f0f0f0', border: 'none', borderRadius: 4, cursor: 'pointer'}}
                        >
                            清空
                        </button>
                        <button
                            onClick={() => setNotificationVisible(false)}
                            style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#999'}}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}

            {/* GitHub confirm dialog */}
            {confirmGithub && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1002, background: 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setConfirmGithub(false)}>
                    <div style={{
                        background: '#fff', borderRadius: 8, padding: '20px 24px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', maxWidth: 320,
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16}}>
                            <QuestionCircleOutlinedIcon style={{color: '#7cb25d', width: 18, height: 18}}/>
                            <span>前往GitHub查看官方文档？</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                            <button onClick={() => setConfirmGithub(false)} style={{padding: '4px 12px', background: '#f0f0f0', border: 'none', borderRadius: 4, cursor: 'pointer'}}>No</button>
                            <button onClick={confirm} style={{padding: '4px 12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Yes</button>
                        </div>
                    </div>
                </div>
            )}

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
                {isExpanded ? (
                    <div className={styles.expandedContent}>
                        <div onClick={handleDebugWorkflow} className={styles.icon}>
                            <img src={debug} alt="icon" style={{width: '30px', height: '30px'}}/>
                        </div>
                        <div onClick={handleWorkflowUpdate} className={styles.icon}>
                            <img src={update} alt="icon" style={{width: '42px', height: '42px'}}/>
                        </div>
                        <div onClick={showModal} className={styles.icon}>
                            <img src={vs} alt="icon" style={{width: '30px', height: '30px'}}/>
                        </div>

                        <div style={{padding: '12px'}} onClick={() => setConfirmGithub(true)}>
                            <div className={styles.icon}>
                                <img src={can} alt="icon" style={{width: '30px', height: '30px'}}/>
                            </div>
                        </div>

                        <div onClick={toggleExpand} className={styles.icon}>
                            <img src={close} alt="icon" style={{width: '30px', height: '30px'}}/>
                        </div>
                    </div>
                ) : "菜单"}
            </div>

            <PushpinOutlinedIcon onClick={handleClick} className={styles.fixedIcon} style={{
                display: isExpanded ? 'block' : 'none',
                position: 'absolute',
                cursor: 'grab',
                left: `${bubblePosition.x + 778}px`,
                top: `${bubblePosition.y - 5}px`,
                transform: rotated ? 'rotate(-45deg)' : 'none',
                transition: 'transform 0.3s',
                width: '16px',
                height: '16px',
            }}/>

            {!rotated && (
                <DragOutlinedIcon
                    className={styles.dragIcon}
                    onMouseDown={handleDragStart}
                    style={{
                        transition: isDragging ? 'none' : 'all 0.3s ease',
                        position: 'absolute',
                        cursor: 'grab',
                        left: `${isExpanded ? bubblePosition.x - 2 : bubblePosition.x + 22}px`,
                        top: `${isExpanded ? bubblePosition.y - 5 : bubblePosition.y - 15}px`,
                        width: '16px',
                        height: '16px',
                    }}
                />
            )}

            <CustomModal
                title="初始代码   VS   当前代码"
                open={isModalVisible}
                onCancel={handleCancel}
                maskClosable={false}
                footer={null}
                width="90vw"
                style={{maxWidth: '92vw', maxHeight: '100vh', overflow: 'hidden'}}
            >
                <CodeDiffViewer
                    language='groovy'
                    onLineClick={handleLineClick}
                    originalCode={JSON.stringify(workflowMetadata == null ? '' : workflowMetadata.scriptMetadata, null, 2)}
                    modifiedCode={JSON.stringify(treeChartState.currentData.scriptMetadata, null, 2)}
                />
            </CustomModal>

            <CustomModal
                title="详细代码对比"
                open={isCompareModalVisible}
                onCancel={handleDetailCancel}
                maskClosable={false}
                footer={null}
                width="70vw"
                style={{maxWidth: '92vw', maxHeight: '100vh', overflow: 'hidden'}}
            >
                <CodeDiffViewer
                    language='groovy'
                    originalCode={compareLines && compareLines.length > 0 ? compareLines[0].content : ''}
                    modifiedCode={compareLines && compareLines.length > 1 ? compareLines[1].content : ''}
                />
            </CustomModal>

            <CustomModal
                title="Debug Workflow"
                open={isDebugVisible}
                onCancel={() => setIsDebugVisible(false)}
                maskClosable={false}
                footer={null}
                width={1000}
                style={{height: '80vh'}}
                draggable
            >
                <DebugForm treeChartState={treeChartState}/>
            </CustomModal>
        </>
    );
};

export default WorkflowMenu;
