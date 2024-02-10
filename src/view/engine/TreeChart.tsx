import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import MovingArrowPattern from "@/components/d3Helpers/MovingArrowPattern.tsx";
import {observer} from 'mobx-react';
import {centerTree} from "@/components/d3Helpers/treeHelpers.ts";

import {D3Node, NodeData, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import {DrawCircle, DrawLinks} from "@/components/D3Node/TreeChartDrawing.ts";
import NodeMenu from "@/components/D3Node/NodeMenu.tsx";
import {Dropdown, MenuProps, Modal} from "antd";
import Editor from "@monaco-editor/react";
import styles from './styles/TreeChart.module.scss'
import WorkflowMenu from "@/view/engine/WorkflowMenu.tsx";
import {WorkflowMetadata} from "@/components/workflow/model/WorkflowModel.ts";


interface TreeChartProps {
    // workflowName: string;
    treeStore: TreeStore;
    initialData: WorkflowMetadata;
    // updateTreeData: (newData: WorkflowMetadata) => void;
}

const ManageModalEditor = React.lazy(() => import('@/components/editor/ManageModalEditor.tsx'));

/**
 * initialData 是引用传递，在后面的操作中，initialData 的值会发生变化 他不是一个不变的值。
 * 如果放在mobx里面的值发生变化，那么就会导致组件重新渲染 会创建一个全新的initialData。会导致你在操作D3的时候 例如CRUD。操作一次 刷新内存地址一次
 * 然而原本的期望是 让initialData 在生命周期一直保持不变 .或者是变动但是是同一个内存地址。而不是创建全新的内存地址 即使他们值是一样的 。
 * 直接影响会导致后面的代码对比 不是初始状态和编辑后的代码对比。
 * <p>特别注意 initialData 在后面的D3操作中会发生变化。内存地址不变。但是值会发生变化。 </p>
 */
const TreeChart: React.FC<TreeChartProps> = observer(({treeStore, initialData}) => {

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
    // const currentTransform = useRef<d3.ZoomTransform | null>(null);


    const closestNodeRef = useRef<D3Node | null>();
    const treeChartState = useRef<TreeChartState | null>();
    // 新增状态来跟踪treeChartState是否准备好
    const [isTreeChartStateReady, setIsTreeChartStateReady] = useState(false);

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [jsonData, setJsonData] = useState('');
    const lockedIconRef = useRef(null);
    const showModal = (data: string) => {
        setJsonData(data);
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        const lockedTongueElement = d3.select(lockedIconRef.current);

        lockedTongueElement.on("mouseover", function () {
            d3.select(this)
                .transition() // 添加平滑过渡效果
                .duration(150) // 过渡时间
                // .attr("transform", "scale(1.1)") // 轻微放大元素，1.1表示放大到原来的110%
                .style("opacity", "0.8"); // 添加透明背景的感觉


        }).on("mouseout", function () {
            // d3.select(this)
            //     .transition()
            //     .duration(150)
            //     .attr("transform", null); // 清除transform属性
        }).on("mousedown", function () {
            d3.select(this)
                .attr("opacity", "0.5"); // 示例：按压时降低透明度
        }).on("mouseup", function () {
            d3.select(this)
                .attr("opacity", "1"); // 示例：释放后恢复透明度
        }).on("mouseleave", function () {
            d3.select(this)
                .attr("opacity", "1"); // 示例：恢复透明度
        });

    }, []); // 确保这些事件监听器在组件加载时添加

    const handleLockedIconClick = () => {
        const lockedTongueElement = d3.select("#lockTongue");


        // 获取元素的宽度，这里假设元素宽度为固定值18，实际应用中可能需要动态计算
        const width = 18; // 例如，lockTongue的宽度

        // 检查当前是否已经应用了旋转变换
        const currentTransform = lockedTongueElement.attr('transform');
        const isUnlocked = currentTransform && currentTransform.includes('scale(-1,1)');

        if (isUnlocked) {
            // 如果已经是解锁状态（已翻转），则恢复原状
            lockedTongueElement
                .transition()
                .duration(500)
                // 使用translate移动到原始位置
                .attr('transform', `translate(0,0) scale(1, 1)`);
        } else {
            // 锁定状态，应用翻转
            lockedTongueElement
                .transition()
                .duration(500)
                // 先向右移动元素宽度的距离，应用翻转，然后再移回来
                .attr('transform', `translate(${width},0) scale(-1, 1) translate(-${width},0)`);
        }
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
        const treeGroup = svgSelect.current!.select<SVGGElement>('g');


        const zoomBehavior = d3
            .zoom()
            .scaleExtent([0.4, 5])
            .on('zoom', (event) => {
                treeStore.setCurrentMenu(null);
                treeStore.setCurrentTransform(event.transform);
                treeGroup.attr('transform', event.transform);
            })

        svgSelect.current!.call(zoomBehavior);
        svgSelect.current!.call(zoomBehavior.transform, d3.zoomIdentity.translate(x, y).scale(1)); // 设置初始缩放和平移
        //很容易双击，所以先取消双击事件
        svgSelect.current!.on("dblclick.zoom", null);


        const initState = {
            gRef: gRef.current!,
            rootNode: rootNode.current,
            svgRef: svgRef.current!,
            treeLayout: treeLayout.current!,
            closestNodeRef: closestNodeRef.current!,
            treeStore: treeStore,
            initialData: initialData
        } as TreeChartState
        treeChartState.current = initState;

        DrawLinks(initState);
        DrawCircle(initState);
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


            <svg
                transform={isTreeChartStateReady ? `translate(${parseFloat(svgSelect.current!.attr("width")) - 220}, 10)` : 'translate(0, 0)'}
                ref={lockedIconRef}
                onClick={handleLockedIconClick}
                width='40px'
                height='40px'
                xmlns="http://www.w3.org/2000/svg"
                cursor={'pointer'}
                viewBox="0 0 35 20" id="myLock">
                <rect x="1" y="8" width="22" height="16" fill="black"></rect>
                <path d="M 6,8 L 6,1 C 6,-2 9,-4 12,-4 C 15,-4 18,-2 18,1 L 18,8" fill="none" stroke="black"
                      strokeWidth="2" id="lockTongue"/>
            </svg>


            <svg ref={svgRef} width={svgHeight} height={svgWidth} onContextMenu={handleContextMenu}></svg>
            <svg>
                <MovingArrowPattern/>
            </svg>


            {/* 编辑器 */}
            <React.Suspense fallback={<div>Loading...</div>}>
                <ManageModalEditor treeStore={treeStore}/>
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
