import React, {Suspense, useEffect, useRef, useState} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import {DragOutlinedIcon, PushpinOutlinedIcon} from '@/components/ui/icons';
import {TreeChartState} from '@/components/D3Node/NodeModel.ts';
import {getWorkflowMetadata, updateWorkflow} from '@/network/api.ts';
import {WorkflowMetadata} from '@/components/model/WorkflowModel.ts';
import debug from '@/assets/logo/debug.svg';
import update from '@/assets/logo/update.svg';
import close from '@/assets/logo/close.svg';
import can from '@/assets/logo/can.svg';
import vs from '@/assets/logo/vs.svg';
import CustomModal from '@/components/ui/CustomModal';
import {toast} from '@/components/ui/toast';
import CompareNotice from '@/view/engine/workflow-menu/CompareNotice.tsx';
import GithubConfirmModal from '@/view/engine/workflow-menu/GithubConfirmModal.tsx';
import CodeCompareModal from '@/view/engine/workflow-menu/CodeCompareModal.tsx';

const DebugForm = React.lazy(() => import('@/view/engine/DebugForm.tsx'));

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

const EXPANDED_WIDTH = 560;
const COLLAPSED_WIDTH = 96;

const calculateInitialPosition = (expanded: boolean = false) => {
    const width = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
    const x = Math.max((window.innerWidth - width) / 2, 24);
    const y = window.innerHeight - 96;
    return {x, y};
};

const WorkflowMenu: React.FC<DraggableBubbleProps> = ({treeChartState}) => {
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

    const handleDebugWorkflow = () => {
        setIsDebugVisible(true);
    };

    const handleDetailCancel = () => {
        setCompareLines(null);
        setIsCompareModalVisible(false);
    };

    const handleDragStart = (event: React.MouseEvent) => {
        if (rotated) {
            return;
        }

        setIsDragging(true);
        treeChartState.treeStore.setCurrentMenu(null);
        event.preventDefault();
        bubbleRef.current = {
            offsetX: event.clientX - bubblePosition.x,
            offsetY: event.clientY - bubblePosition.y,
        };
    };

    const handleOnRemove = (index: number) => {
        setCompareLines((prev) => {
            if (!prev || prev.length === 0) {
                return prev;
            }

            const updatedLines = prev.filter((_, itemIndex) => itemIndex !== index);
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
        const scriptTextIndex = lineContent.indexOf('scriptText":');

        if (scriptTextIndex === -1) {
            toast.success('Only scriptText blocks can be compared');
            return;
        }

        const label = lineContent.substring(scriptTextIndex + 12, scriptTextIndex + 162);
        const code = lineContent.substring(scriptTextIndex + 12).trim().replace(/,$/, '');

        setCompareLines((prev) => {
            const currentLines = prev || [];

            if (currentLines.length >= 2) {
                return [...currentLines];
            }

            const newLine = {content: JSON.parse(code), label};
            return [...currentLines, newLine];
        });
    };

    const handleDragMove = (event: MouseEvent) => {
        if (!isDragging) {
            return;
        }

        const width = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
        const newX = event.clientX - bubbleRef.current!.offsetX;
        const newY = event.clientY - bubbleRef.current!.offsetY;
        const svgBounds = treeChartState.svgRef.getBoundingClientRect();
        const minX = svgBounds.left + 16;
        const maxX = svgBounds.right - width - 16;
        const minY = svgBounds.top + 16;
        const maxY = svgBounds.bottom - 72;

        setBubblePosition({
            x: Math.max(Math.min(newX, maxX), minX),
            y: Math.max(Math.min(newY, maxY), minY),
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const toggleExpand = () => {
        if (rotated) {
            toast.success('Unpin the dock before resizing it');
            return;
        }

        setIsExpanded((prev) => {
            const next = !prev;
            setBubblePosition(calculateInitialPosition(next));
            return next;
        });
    };

    const handleWorkflowUpdate = () => {
        toast.success('Loading...');
        setTimeout(() => {
            updateWorkflow(treeChartState.currentData).then((result) => {
                if (result) {
                    toast.success('Update succeeded');
                } else {
                    toast.error('Update failed');
                }
            });
        }, 500);
    };

    useEffect(() => {
        const handleResize = () => {
            setBubblePosition(calculateInitialPosition(isExpanded));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded]);

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
    }, [isDragging, isExpanded]);

    const confirm = () => {
        window.open('https://github.com/code-visual/visual-flowengine-spring-boot-starter', '_blank');
        setConfirmGithub(false);
    };

    const actions = [
        {
            key: 'debug',
            label: 'Debug',
            icon: debug,
            iconStyle: {width: '28px', height: '28px'},
            onClick: handleDebugWorkflow,
        },
        {
            key: 'update',
            label: 'Deploy',
            icon: update,
            iconStyle: {width: '34px', height: '34px'},
            onClick: handleWorkflowUpdate,
        },
        {
            key: 'compare',
            label: 'Compare',
            icon: vs,
            iconStyle: {width: '28px', height: '28px'},
            onClick: showModal,
        },
        {
            key: 'starter',
            label: 'Starter',
            icon: can,
            iconStyle: {width: '28px', height: '28px'},
            onClick: () => setConfirmGithub(true),
        },
    ];

    return (
        <>
            <CompareNotice
                visible={notificationVisible}
                compareLines={compareLines}
                onCompare={handleCompare}
                onClear={clean}
                onHide={() => setNotificationVisible(false)}
                onRemove={handleOnRemove}
            />

            <GithubConfirmModal
                open={confirmGithub}
                onConfirm={confirm}
                onCancel={() => setConfirmGithub(false)}
            />

            <div
                style={{
                    left: `${bubblePosition.x}px`,
                    top: `${bubblePosition.y}px`,
                    transition: isDragging ? 'none' : 'box-shadow 0.25s ease, transform 0.25s ease',
                }}
                onClick={() => {
                    if (!isExpanded) {
                        toggleExpand();
                    }
                }}
                className={isExpanded ? styles.expanded : styles.bubble}
                onMouseDown={handleDragStart}
            >
                {isExpanded ? (
                    <div className={styles.expandedContent}>
                        <div className={styles.dockMeta}>
                            <span className={styles.dockEyebrow}>Workflow Actions</span>
                            <strong className={styles.dockTitle}>Canvas Dock</strong>
                            <span className={styles.dockHint}>Drag to move, pin to lock</span>
                        </div>
                        <div className={styles.actionRail}>
                            {actions.map((action) => (
                                <button
                                    key={action.key}
                                    type="button"
                                    onClick={action.onClick}
                                    className={styles.actionButton}
                                >
                                    <span className={styles.actionIconShell}>
                                        <img src={action.icon} alt={action.label} style={action.iconStyle}/>
                                    </span>
                                    <span className={styles.actionLabel}>{action.label}</span>
                                </button>
                            ))}
                        </div>
                        <button type="button" onClick={toggleExpand} className={styles.closeButton}>
                            <img src={close} alt="Close" style={{width: '20px', height: '20px'}}/>
                        </button>
                    </div>
                ) : <span className={styles.collapsedLabel}>Actions</span>}
            </div>

            <PushpinOutlinedIcon
                onClick={handleClick}
                className={styles.fixedIcon}
                style={{
                    display: isExpanded ? 'block' : 'none',
                    position: 'absolute',
                    cursor: 'grab',
                    left: `${bubblePosition.x + EXPANDED_WIDTH - 24}px`,
                    top: `${bubblePosition.y - 10}px`,
                    transform: rotated ? 'rotate(-45deg)' : 'none',
                    transition: 'transform 0.3s',
                    width: '18px',
                    height: '18px',
                }}
            />

            {!rotated && (
                <DragOutlinedIcon
                    className={styles.dragIcon}
                    onMouseDown={handleDragStart}
                    style={{
                        transition: isDragging ? 'none' : 'all 0.3s ease',
                        position: 'absolute',
                        cursor: 'grab',
                        left: `${isExpanded ? bubblePosition.x + 14 : bubblePosition.x + 36}px`,
                        top: `${bubblePosition.y - 10}px`,
                        width: '18px',
                        height: '18px',
                    }}
                />
            )}

            <CodeCompareModal
                title="Initial Code VS Current Code"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                originalCode={JSON.stringify(workflowMetadata == null ? '' : workflowMetadata.scriptMetadata, null, 2)}
                modifiedCode={JSON.stringify(treeChartState.currentData.scriptMetadata, null, 2)}
                onLineClick={handleLineClick}
            />

            <CodeCompareModal
                title="Detailed Code Compare"
                open={isCompareModalVisible}
                onCancel={handleDetailCancel}
                originalCode={compareLines && compareLines.length > 0 ? compareLines[0].content : ''}
                modifiedCode={compareLines && compareLines.length > 1 ? compareLines[1].content : ''}
                width="70vw"
            />

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
                <Suspense fallback={<div>Loading debug panel...</div>}>
                    <DebugForm treeChartState={treeChartState}/>
                </Suspense>
            </CustomModal>
        </>
    );
};

export default WorkflowMenu;
