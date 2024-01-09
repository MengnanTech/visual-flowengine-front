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
        treeChartState.current =initState;

        DrawLinks(initState);
        DrawCircle(initState);
        setIsTreeChartStateReady(true);
    }, [initialData, treeStore]);


    return (
        <div>
            <svg ref={svgRef} width="2300" height="1200">
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
        </div>
    );
});

export default TreeChart;
