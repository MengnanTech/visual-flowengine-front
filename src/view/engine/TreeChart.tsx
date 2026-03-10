import React, {useCallback, useRef, useState} from 'react';
import MovingArrowPattern from '@/components/d3Helpers/MovingArrowPattern.tsx';
import {observer} from 'mobx-react';
import {TreeStore} from '@/store/TreeStore.ts';
import NodeMenu from '@/components/D3Node/NodeMenu.tsx';
import styles from './styles/TreeChart.module.scss';
import WorkflowMenu from '@/view/engine/WorkflowMenu.tsx';
import {WorkflowMetadata} from '@/components/model/WorkflowModel.ts';
import TreeToolbar from '@/view/engine/tree-chart/TreeToolbar.tsx';
import SourceCodeModal from '@/view/engine/tree-chart/SourceCodeModal.tsx';
import {useTreeChartLayout} from '@/view/engine/tree-chart/useTreeChartLayout.ts';

interface TreeChartProps {
    treeStore: TreeStore;
    initialData: WorkflowMetadata;
    updateTreeData: (newData: WorkflowMetadata) => void;
}

const ManageModalEditor = React.lazy(() => import('@/components/editor/ManageModalEditor.tsx'));

const TreeChart: React.FC<TreeChartProps> = observer(({
    treeStore,
    initialData,
    updateTreeData,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const lockedIconRef = useRef<SVGSVGElement>(null);
    const refreshIconRef = useRef<SVGSVGElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [jsonData, setJsonData] = useState('');
    const [readonly, setReadonly] = useState(true);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    const {
        gRef,
        rootNode,
        svgSelect,
        treeChartState,
        isTreeChartStateReady,
        windowSize,
    } = useTreeChartLayout({
        initialData,
        treeStore,
        svgRef,
        onBackgroundClick: closeContextMenu,
    });

    const showSourceCode = (data: string) => {
        setJsonData(data);
        setIsModalVisible(true);
    };

    const handleContextMenu = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        event.preventDefault();

        if (event.target === svgRef.current) {
            setContextMenu({
                x: event.clientX,
                y: event.clientY,
            });
        }
    };

    const svgWidth = windowSize.windowWidth - treeStore.siderWidth;
    const svgHeight = windowSize.windowHeight - 62;

    return (
        <div>
            <div style={{position: 'relative', overflowX: 'hidden'}}>
                <TreeToolbar
                    isReady={isTreeChartStateReady}
                    treeStore={treeStore}
                    svgRef={svgRef}
                    svgSelect={svgSelect}
                    gRef={gRef}
                    rootNode={rootNode}
                    lockedIconRef={lockedIconRef}
                    refreshIconRef={refreshIconRef}
                    initialData={initialData}
                    updateTreeData={updateTreeData}
                    setReadonly={setReadonly}
                />

                <svg ref={svgRef} width={svgWidth} height={svgHeight} onContextMenu={handleContextMenu}/>
                <div style={{position: 'absolute', top: 0, left: 0}}>
                    <svg>
                        <MovingArrowPattern/>
                    </svg>
                </div>
            </div>

            {treeStore.clickNode && (
                <React.Suspense fallback={<div>Loading...</div>}>
                    <ManageModalEditor treeStore={treeStore} readonly={readonly}/>
                </React.Suspense>
            )}

            {isTreeChartStateReady && <WorkflowMenu treeChartState={treeChartState.current!}/>}
            {isTreeChartStateReady && <NodeMenu treeChartState={treeChartState.current!}/>}

            <SourceCodeModal
                open={isModalVisible}
                jsonData={jsonData}
                onCancel={() => setIsModalVisible(false)}
            />

            {contextMenu && (
                <div
                    className={styles.dropdownCustom}
                    style={{
                        position: 'absolute',
                        left: `${contextMenu.x - treeStore.siderWidth}px`,
                        top: `${contextMenu.y}px`,
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{padding: '8px 12px', cursor: 'pointer'}}
                        onClick={() => {
                            showSourceCode(JSON.stringify(rootNode.current!.data, null, 2));
                            closeContextMenu();
                        }}
                        onMouseEnter={(event) => {
                            event.currentTarget.style.backgroundColor = '#f0f0f0';
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        查看源代码
                    </div>
                </div>
            )}
        </div>
    );
});

export default TreeChart;
