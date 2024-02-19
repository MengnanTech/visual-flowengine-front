import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import MovingArrowPattern from "@/components/d3Helpers/MovingArrowPattern.tsx";
import {observer} from 'mobx-react';
import {centerTree} from "@/components/d3Helpers/treeHelpers.ts";

import {D3Node, NodeData, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import {circleEvent, DrawCircle, DrawLinks, endNodeEvent} from "@/components/D3Node/TreeChartDrawing.ts";
import NodeMenu from "@/components/D3Node/NodeMenu.tsx";
import {Dropdown, MenuProps, message, Modal} from "antd";
import Editor from "@monaco-editor/react";
import styles from './styles/TreeChart.module.scss'
import WorkflowMenu from "@/view/engine/WorkflowMenu.tsx";
import {WorkflowMetadata} from "@/components/model/WorkflowModel.ts";
import {getWorkflowMetadata} from "@/network/api.ts";


interface TreeChartProps {
    // workflowName: string;
    treeStore: TreeStore;
    initialData: WorkflowMetadata;
    updateTreeData: (newData: WorkflowMetadata) => void;
    forceUpdateTreeChart: () => void;
}

const ManageModalEditor = React.lazy(() => import('@/components/editor/ManageModalEditor.tsx'));

const pageContainerLockBackgroundColor = '#e6e6ea';
/**
 * initialData 是引用传递，在后面的操作中，initialData 的值会发生变化 他不是一个不变的值。
 * 如果放在mobx里面的值发生变化，那么就会导致组件重新渲染 会创建一个全新的initialData。会导致你在操作D3的时候 例如CRUD。操作一次 刷新内存地址一次
 * 然而原本的期望是 让initialData 在生命周期一直保持不变 .或者是变动但是是同一个内存地址。而不是创建全新的内存地址 即使他们值是一样的 。
 * 直接影响会导致后面的代码对比 不是初始状态和编辑后的代码对比。
 * <p>特别注意 initialData 在后面的D3操作中会发生变化。内存地址不变。但是值会发生变化。 </p>
 */
const TreeChart: React.FC<TreeChartProps> = observer(({
                                                          treeStore,
                                                          initialData,
                                                          updateTreeData,
                                                          forceUpdateTreeChart
                                                      }) => {

    console.log("TreeChart render", initialData)
    const svgRef = useRef<SVGSVGElement>(null);
    const svgSelect = useRef<d3.Selection<any, any, any, any> | null>(null);
    const gRef = useRef<d3.Selection<any, any, any, any> | null>(null);
    const rootNode = useRef<D3Node>();
    const treeLayout = useRef(d3.tree<NodeData>()
        .nodeSize([100, 250])
        /**
         * 定义邻居节点的距离
         */
        .separation(function () {
            return 1;
        }));

    const closestNodeRef = useRef<D3Node | null>();
    const treeChartState = useRef<TreeChartState | null>();
    // 新增状态来跟踪treeChartState是否准备好
    const [isTreeChartStateReady, setIsTreeChartStateReady] = useState(false);

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [jsonData, setJsonData] = useState('');
    const [readonly, setReadonly] = useState(true);
    const lockedIconRef = useRef(null);
    const refreshIconRef = useRef(null);

    const showModal = (data: string) => {
        setJsonData(data);
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleLockedIconClick = () => {
        const lockedTongueElement = d3.select("#lockTongue");

        // 获取元素的宽度，这里假设元素宽度为固定值18，实际应用中可能需要动态计算
        const width = 18; // 例如，lockTongue的宽度

        // 检查当前是否已经应用了旋转变换
        const currentTransform = lockedTongueElement.attr('transform');
        const isUnlocked = currentTransform && currentTransform.includes('scale(-1,1)');

        if (isUnlocked) {
            setReadonly(true);
            svgRef.current!.style.backgroundColor = pageContainerLockBackgroundColor;
            lockedTongueElement
                .transition()
                .duration(500)
                // 使用translate移动到原始位置
                .attr('transform', `translate(0,0) scale(1, 1)`).on('end', () => {
                //禁用缩放 平移
                svgSelect.current!.call(d3.zoom().on('zoom', null));

                let selection = gRef.current!.selectAll("circle");
                const endNodes = gRef.current!.selectAll<SVGRectElement, D3Node>("rect");
                endNodes.on("mouseover", null)
                    .on("mouseout", null);
                selection
                    .on("mouseover", null)
                    .on("mouseout", null);

            });
        } else {
            setReadonly(false);
            svgRef.current!.style.backgroundColor = '#c6c6e1';
            // 锁定状态，应用翻转
            lockedTongueElement
                .transition()
                .duration(500)
                // 先向右移动元素宽度的距离，应用翻转，然后再移回来
                .attr('transform', `translate(${width},0) scale(-1, 1) translate(-${width},0)`)
                .on('end', () => {
                    const treeGroup = svgSelect.current!.select<SVGGElement>('g');

                    const width = +svgSelect.current!.attr("width");
                    const height = +svgSelect.current!.attr("height");
                    const [x, y] = centerTree(rootNode.current!, width, height);
                    const zoomBehavior = d3
                        .zoom()
                        .scaleExtent([0.4, 5])
                        .on('zoom', (event) => {
                            treeStore.setCurrentMenu(null);
                            treeStore.setCurrentTransform(event.transform);
                            treeGroup.attr('transform', event.transform);
                        })

                    svgSelect.current!.call(zoomBehavior);
                    svgSelect.current!.call(zoomBehavior.transform, treeStore.currentTransform == null ? d3.zoomIdentity.translate(x, y).scale(1) : treeStore.currentTransform);


                    const circles = gRef.current!.selectAll<SVGCircleElement, D3Node>("circle");
                    const endNodes = gRef.current!.selectAll<SVGRectElement, D3Node>("rect");
                    circleEvent(circles, svgRef.current!, treeStore);
                    endNodeEvent(endNodes, svgRef.current!, treeStore);
                })

            ;
        }
    };
    const handleRefreshIconClick = () => {


        let selection = d3.select(refreshIconRef.current);

        selection
            .transition()
            .duration(500)
            .attrTween("transform", function () {
                // 获取当前的transform属性值，以便保留除旋转外的其他变换
                const currentTransform = d3.select(this).attr("transform") || '';
                // 插值器从当前角度到360度
                return function (t) {


                    const rotateTransform = `rotate(${360 * t})`;
                    return `${currentTransform} ${rotateTransform}`;
                };
            })

            .on("end", function () {
                getWorkflowMetadata(initialData.workflowId).then((res) => {
                    updateTreeData(res);
                    forceUpdateTreeChart()
                }).finally(() => {
                    message.success('刷新成功');
                })
            });
    };

    const handleContextMenu = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        event.preventDefault();

        // 检查是否在SVG空白位置上点击
        if (event.target === svgRef.current) {
            setContextMenu({
                x: event.clientX,
                y: event.clientY
            });
        }
    };
    const closeContextMenu = () => {
        setContextMenu(null);
    };

    useEffect(() => {

        d3.select(svgRef.current).selectAll("*").remove();
        rootNode.current = d3.hierarchy(initialData.scriptMetadata) as D3Node;
        svgSelect.current = d3.select(svgRef.current);
        gRef.current = svgSelect.current.append("g");
        d3.select('body').on('click', () => {
            // 点击页面任何其他地方时隐藏菜单
            treeStore.setCurrentMenu(null);
        });
        const root = rootNode.current;
        gRef.current.append("path")
            .attr("class", "preview-line")
            .style("stroke", "red")  // 预览线的颜色
            .attr("stroke-width", 4)
            .style("stroke-dasharray", "5,5")  // 虚线样式
            .style("opacity", 0);  // 初始不可见

        treeLayout.current(root);
        const width = +svgSelect.current!.attr("width");
        const height = +svgSelect.current!.attr("height");
        const [x, y] = centerTree(root, width, height);
        gRef.current!.attr("transform", `translate(${x},${y})`);
        // 设置初始缩放和平移
        //很容易双击，所以先取消双击事件
        svgSelect.current!.on("dblclick.zoom", null);

        const initState = {
            gRef: gRef.current!,
            rootNode: rootNode.current,
            svgRef: svgRef.current!,
            treeLayout: treeLayout.current!,
            closestNodeRef: closestNodeRef.current!,
            treeStore: treeStore,
            currentData: initialData
        } as TreeChartState
        treeChartState.current = initState;

        rootNode.current.descendants().forEach(d => {

            d.previousX = d.x
            d.previousY = d.y
        });

        DrawLinks(initState);
        DrawCircle(initState, false);
        setIsTreeChartStateReady(true);

        window.addEventListener('click', closeContextMenu);
        return () => {
            window.removeEventListener('click', closeContextMenu);
        };


    }, [treeStore]);

    // 计算svg窗口大小
    const [windowWidth] = useState(window.innerWidth);
    const [windowHeight] = useState(window.innerHeight);
    const svgHeight = windowWidth - 256

    const svgWidth = windowHeight - 62

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <div>
                    查看源代码
                </div>
            ),
            onClick: () => {
                showModal(JSON.stringify(rootNode.current!.data, null, 2))
            }
        }
    ];
    // 编辑器配置项
    const editorOptions = {
        scrollBeyondLastLine: false, // 设置编辑器是否可以滚动到最后一行之后
        readOnly: true,
    };

    return (
        <div>
            <div style={{position: 'relative', overflowX: 'hidden'}}>
                <svg
                    style={{position: 'absolute', left: '10px', borderRadius: '50%', padding: '8px 10px'}}
                    className={styles.iconWrapper}
                    transform={isTreeChartStateReady ? `translate(${parseFloat(svgSelect.current!.attr("width")) - 180}, 10)` : undefined}
                    ref={lockedIconRef}
                    visibility={isTreeChartStateReady ? 'visible' : 'hidden'}
                    onClick={handleLockedIconClick}
                    width='40px'
                    height='40px'
                    xmlns="http://www.w3.org/2000/svg"
                    cursor={'pointer'}
                    viewBox="0 -2 25 25" id="myLock">
                    <rect x="1" y="8" width="22" height="16" fill="black"></rect>
                    <path d="M 6,8 L 6,1 C 6,-2 9,-4 12,-4 C 15,-4 18,-2 18,1 L 18,8" fill="none" stroke="black"
                          strokeWidth="2" id="lockTongue"/>
                </svg>

                <svg fill="#000000"
                     style={{position: 'absolute', left: '50px', borderRadius: '50%', padding: '8px 2px'}}
                     className={styles.iconWrapper}
                     ref={refreshIconRef}
                     visibility={isTreeChartStateReady ? 'visible' : 'hidden'}
                     onClick={handleRefreshIconClick}
                     width='40px'
                     height='40px'
                     cursor={'pointer'}
                     transform={isTreeChartStateReady ? `translate(${parseFloat(svgSelect.current!.attr("width")) - 280}, 10)` : undefined}
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 489.645 489.645">
                    <g>
                        <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3
                        c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5
                        c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8
                        c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2
                        C414.856,432.511,548.256,314.811,460.656,132.911z"/>
                    </g>
                </svg>

                <svg ref={svgRef} width={svgHeight} height={svgWidth} onContextMenu={handleContextMenu}></svg>
                <div style={{position: 'absolute', top: 0, left: 0}}>
                    <svg>
                        <MovingArrowPattern/>
                    </svg>
                </div>

            </div>


            {/* 编辑器 */}
            <React.Suspense fallback={<div>Loading...</div>}>
                <ManageModalEditor treeStore={treeStore} readonly={readonly}/>
            </React.Suspense>
            {/*工具栏菜单*/}
            {isTreeChartStateReady && <WorkflowMenu treeChartState={treeChartState.current!}/>}
            {/*悬浮菜单*/}
            {isTreeChartStateReady && <NodeMenu treeChartState={treeChartState.current!}/>}
            <Modal
                title="源代码"
                open={isModalVisible}
                centered
                onCancel={handleCancel}
                maskClosable={false}
                footer={null}
                width={1000}
            >
                <Editor
                    key={Math.random()}
                    height="70vh"
                    defaultLanguage="json"
                    defaultValue={jsonData}
                    options={editorOptions}
                />
            </Modal>

            {contextMenu && (
                <Dropdown menu={{items}}
                          open={true}
                          key={Math.random()}
                          className={styles.dropdownCustom}
                >
                    <div
                        style={{
                            position: 'absolute',
                            left: `${contextMenu.x - treeStore.siderWidth}px`,
                            top: `${contextMenu.y}px`,
                        }}
                        onClick={closeContextMenu}
                    />
                </Dropdown>
            )}

        </div>

    );
});

export default TreeChart;
