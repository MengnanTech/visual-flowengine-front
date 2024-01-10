import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import MovingArrowPattern from "@/components/d3Helpers/MovingArrowPattern.tsx";
import {observer} from 'mobx-react';
import {centerTree} from "@/components/d3Helpers/treeHelpers.ts";
import ManageModalEditor from "@/components/editor/ManageModalEditor.tsx";
import {D3Node, NodeData, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import {DrawCircle, DrawLinks} from "@/components/D3Node/TreeChartDrawing.ts";
import NodeMenu from "@/components/D3Node/NodeMenu.tsx";
import ContextMenu from "@/components/d3Helpers/ContextMenu.tsx";
import {Button, Modal, Switch} from "antd";
import Editor from "@monaco-editor/react";
import {SyncOutlined} from "@ant-design/icons";

interface TreeChartProps {
    treeStore: TreeStore;
    initialData: NodeData;
}


const TreeChart: React.FC<TreeChartProps> = observer(({treeStore, initialData}) => {

    const svgRef = useRef(null);
    const svgSelect = useRef<d3.Selection<any, any, any, any> | null>(null);
    const gRef = useRef<d3.Selection<any, any, any, any> | null>(null);
    const rootNode = useRef(d3.hierarchy(initialData) as D3Node);
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

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        options: { label: string; action: () => void }[]
    } | null>(null);
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

    // 处理局部刷新的函数
    const handleRefresh = () => {
        // 刷新逻辑
    };

    // 处理锁定开关变化的函数
    const handleLockChange = (checked:boolean) => {
        setIsLocked(checked);
        // 锁定或解锁布局的逻辑
    };

    // 处理重置布局的函数
    const handleResetLayout = () => {
        // 重置布局逻辑
    };
    const handleContextMenu = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        event.preventDefault();

        // 检查是否在SVG空白位置上点击
        if (event.target === svgRef.current) {
            setContextMenu({
                x: event.clientX,
                y: event.clientY,
                options: [
                    {
                        label: '查看源代码',
                        action: () => showModal(JSON.stringify(rootNode.current.data, null, 2))
                    },
                    // ...更多选项
                ]
            });
        }
    };
    const closeContextMenu = () => {
        setContextMenu(null);
    };


    useEffect(() => {

        svgSelect.current = d3.select(svgRef.current)

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

        console.log("root", JSON.stringify(root.data))
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

        window.addEventListener('click', closeContextMenu);
        return () => {
            window.removeEventListener('click', closeContextMenu);
        };


    }, [initialData, treeStore]);


    return (
        <div>
            <svg ref={svgRef} width="2300" height="1200" onContextMenu={handleContextMenu}>
                <MovingArrowPattern/>
            </svg>

            <svg>
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                            markerWidth="6" markerHeight="6"
                            orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f00"/>
                    </marker>
                </defs>
            </svg>

            {/* 编辑器 */}
            <ManageModalEditor treeStore={treeStore}/>
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
                    key={new Date().getTime()}
                    height="70vh"
                    defaultLanguage="json"
                    defaultValue={jsonData}
                    options={{
                        readOnly: true
                    }}
                />
            </Modal>


            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x-255}
                    y={contextMenu.y}
                    options={contextMenu.options}
                    onClose={closeContextMenu}
                />
            )}
            <div style={{position: 'absolute', top: 0, right: 0, padding: '36px'}}>
                <Button icon={<SyncOutlined/>} onClick={handleRefresh}>刷新</Button>
                <Switch checkedChildren="锁定" unCheckedChildren="解锁" checked={isLocked} onChange={handleLockChange}/>
                <Button onClick={handleResetLayout}>重置布局</Button>
            </div>
        </div>

    );
});

export default TreeChart;
