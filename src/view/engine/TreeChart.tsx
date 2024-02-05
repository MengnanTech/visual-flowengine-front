import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import MovingArrowPattern from "@/components/d3Helpers/MovingArrowPattern.tsx";
import {observer} from 'mobx-react';
import {centerTree} from "@/components/d3Helpers/treeHelpers.ts";

import {D3Node, NodeData, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import {DrawCircle, DrawLinks, refresh} from "@/components/D3Node/TreeChartDrawing.ts";
import NodeMenu from "@/components/D3Node/NodeMenu.tsx";
import {Dropdown, MenuProps, Modal} from "antd";
import Editor from "@monaco-editor/react";
import styles from './styles/TreeChart.module.scss'
import lockedIcon from '@/assets/logo/locked_icon.svg'
import unlockedIcon from '@/assets/logo/unlocked_icon.svg'
import refreshIcon from '@/assets/logo/refresh.svg'
import DraggableBubble from "@/view/engine/DraggableBubble.tsx";

interface TreeChartProps {
    // workflowName: string;
    treeStore: TreeStore;
    initialData: NodeData;
}

const ManageModalEditor = React.lazy(() => import('@/components/editor/ManageModalEditor.tsx'));

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
    const showModal = (data: string) => {
        setJsonData(data);
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const [isLocked, setIsLocked] = useState(false);
    //
    // // 处理局部刷新的函数
    // const handleRefresh = () => {
    //     // 刷新逻辑
    // };
    //
    // // 处理锁定开关变化的函数
    //
    // // 处理重置布局的函数
    // const handleResetLayout = () => {
    //     // 重置布局逻辑
    // };
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
        rootNode.current = d3.hierarchy(initialData) as D3Node;
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
            treeStore: treeStore
        } as TreeChartState
        treeChartState.current = initState;

        DrawLinks(initState);
        DrawCircle(initState);
        setIsTreeChartStateReady(true);


        const iconWidth = 15; // 每个图标的宽度
        const iconSpacing = 30; // 图标之间的间距
        const iconGroup = svgSelect.current.append('g')
            .attr('transform', `translate(${width - 200}, 10)`); // 位于右上角，留出一些边距

        // 添加图标到图标组
        iconGroup.append('image')
            .attr('href', refreshIcon)
            .attr('width', 30)
            .attr('height', 30)
            .attr('x', 0) // 第一个图标的x坐标
            .attr('y', 0)
            .on('click', function () {

                const x = parseFloat(d3.select(this).attr('x')) + iconWidth / 2;
                const y = parseFloat(d3.select(this).attr('y')) + iconWidth / 2;

                d3.select(this).transition()
                    .duration(1000) // 旋转持续时间
                    .attrTween('transform', function () {
                        return d3.interpolateString(
                            `rotate(0, ${x + 5}, ${y + 9})`,
                            `rotate(360, ${x + 5}, ${y + 9})`
                        );
                    });
                refresh(initState)
            }) // 添加刷新逻辑


        const lockIcon = iconGroup.append('image')
            .attr('href', isLocked ? lockedIcon : unlockedIcon)
            .attr('width', 30)
            .attr('height', 30)
            .attr('x', iconWidth + iconSpacing) // 第二个图标的x坐标
            .attr('y', 0)
            .attr('class', styles.iconHover) // 应用悬浮效果样式
            .on('click', () => {
                setIsLocked(prevState => !prevState);
            });

        lockIcon
            .on('mousedown', function () {
                d3.select(this).classed(styles.iconActive, true); // 添加按压样式
            })
            .on('mouseup', function () {
                d3.select(this).classed(styles.iconActive, false); // 移除按压样式
            })
            .on('mouseleave', function () {
                d3.select(this).classed(styles.iconActive, false); // 鼠标离开时移除样式
            });
        // iconGroup.append('image')
        //     .attr('href', isLocked ? 'path/to/locked_icon.svg' : 'path/to/unlocked_icon.svg')
        //     .attr('width', 30)
        //     .attr('height', 30)
        //     .attr('x', 2 * (iconWidth + iconSpacing)) // 第三个图标的x坐标
        //     .attr('y', 0)
        //     .on('click', handleLockChange);


        iconGroup.attr('pointer-events', 'all'); // 确保图标可以交互
        window.addEventListener('click', closeContextMenu);
        return () => {
            window.removeEventListener('click', closeContextMenu);
        };


    }, [initialData, treeStore]);
    useEffect(() => {
        const lockIconHref = isLocked ? lockedIcon : unlockedIcon;
        svgSelect.current!
            .select(`image.${styles.iconHover}`) // 使用模块化样式类选择元素
            .attr('href', lockIconHref);
    }, [isLocked]); // 监听isLocked状态的变化，以及styles.lockIcon以防它是动态的

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
            <svg ref={svgRef} width={svgHeight} height={svgWidth} onContextMenu={handleContextMenu}></svg>
            <svg>
                <MovingArrowPattern/>
            </svg>
            <DraggableBubble/>


            {/* 编辑器 */}
            <React.Suspense fallback={<div>Loading...</div>}>
                <ManageModalEditor treeStore={treeStore}/>
            </React.Suspense>
            {/*悬浮菜单*/}
            {isTreeChartStateReady && <NodeMenu treeStore={treeStore} treeChartState={treeChartState.current!}/>}
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
