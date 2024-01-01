import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {v4 as uuid} from 'uuid'
import MovingArrowPattern from "@/components/d3Helpers/MovingArrowPattern.tsx";
import {message, Popover} from "antd";

import TreeChartStyles from './TreeChart.module.scss'
import {SmileFilled} from "@ant-design/icons";
import {observer} from 'mobx-react';
import {centerTree} from "@/components/d3Helpers/treeHelpers.ts";
import ManageModalEditor from "@/components/editor/ManageModalEditor.tsx";
import {D3Link, D3Node, NodeData} from "@/components/D3Node/D3model.ts";
import {TreeStore} from "@/store/TreeStore.ts";
import {DrawCircle, DrawLinks} from "@/components/d3Helpers/TreeChartDrawing.ts";


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
    const currentTransform = useRef<d3.ZoomTransform | null>(null);
    const closestNodeRef = useRef<D3Node | null>();

    function refresh() {
        rootNode.current.descendants().forEach(d => {

            d.previousX = d.x
            d.previousY = d.y
        });


        const root = rootNode.current;
        console.log("data", JSON.stringify(root.data))
        treeLayout.current(root);
        gRef.current!.attr("transform", currentTransform.current!.toString());

        DrawLinks(gRef.current!,rootNode.current);
        DrawCircle(gRef.current!,rootNode.current,svgRef.current,treeStore);
    }


    function removeCurrentTree(nodeToRemove: D3Node) {
        // 找到所有子孙节点
        if (nodeToRemove.parent == null) {
            message.error('根节点无法删除').then(r => r)
            return
        }
        const descendants = nodeToRemove.descendants();
        const descendantIds = new Set(descendants.map(d => d.data.id));
        // 定义被删除节点的父节点位置

        // 选中所有要移除的节点和连接线
        const nodesToRemove = gRef.current!.selectAll<SVGCircleElement, D3Node>('.node')
            .filter(function (d: D3Node) {
                return descendantIds.has(d.data.id);
            });
        const linksToRemove = gRef.current!.selectAll<SVGCircleElement, D3Link>('.link')
            .filter((d: D3Link) => {
                return descendantIds.has(d.target.data.id);
            });

        // 应用过渡效果，使节点和连接线渐渐消失
        nodesToRemove.transition().duration(750)
            .style('opacity', 0)
            .attr("transform", `translate(${nodeToRemove.parent.y},${nodeToRemove.parent.x})`)
            .remove();

        linksToRemove.transition().duration(750)
            .style('opacity', 0)
            .attrTween("d", function (d): (t: number) => string {
                const o = {x: nodeToRemove.parent!.x, y: nodeToRemove.parent!.y}; // 父节点的位置
                const interpolateSourceX = d3.interpolate(d.source.x, o.x);
                const interpolateSourceY = d3.interpolate(d.source.y, o.y);
                const interpolateTargetX = d3.interpolate(d.target.x, o.x);
                const interpolateTargetY = d3.interpolate(d.target.y, o.y);

                return function (t: number): string {
                    // 计算当前插值状态
                    const sourceX = interpolateSourceX(t);
                    const sourceY = interpolateSourceY(t);
                    const targetX = interpolateTargetX(t);
                    const targetY = interpolateTargetY(t);

                    // 返回当前的路径
                    const spreadElements: D3Link = {
                        source: {x: sourceX, y: sourceY} as D3Node,
                        target: {x: targetX, y: targetY} as D3Node
                    };
                    return d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)(spreadElements)!;
                };
            })
            .remove();


        const parentChildren = nodeToRemove.parent.children;
        if (parentChildren) {
            nodeToRemove.parent.children = parentChildren.filter(child => child !== nodeToRemove);
            if (nodeToRemove.parent.children.length === 0) {
                delete nodeToRemove.parent.children;
            }
        }
        if (nodeToRemove.parent.data.children) {

            for (let i = 0; i < nodeToRemove.parent.data.children?.length; i++) {
                if (nodeToRemove.parent.data.children[i].id === nodeToRemove.data.id) {
                    nodeToRemove.parent.data.children.splice(i, 1)
                }
            }
        }

        setTimeout(refresh, 750);
    }

    function updateNodeDepth(node: D3Node, newDepth: number) {
        node.depth = newDepth;
        if (node.children) {
            node.children.forEach(child => updateNodeDepth(child, newDepth + 1));
        }
    }

    function addNode(clickedNode: D3Node) {

        const newNodeData: NodeData =
            {

                id: uuid(),
                name: "New Node" + Math.floor(Math.random() * 90) + 100,
                nodeType: "还没想好设计",
                scriptText: "脚本内容" + uuid(),
            };

        if (!clickedNode.data.children) {
            clickedNode.data.children = [];
        }
        clickedNode.data.children.push(newNodeData);

        if (!clickedNode.children) {
            clickedNode.children = [];
        }

        const newNode = d3.hierarchy(newNodeData) as D3Node;
        newNode.depth = clickedNode.depth + 1;
        newNode.parent = clickedNode;
        clickedNode.children.push(newNode);
        refresh();
        const nodesEnter = gRef.current!.select<SVGGElement>(`#node-${newNodeData.id}`);
        nodesEnter.transition()
            .duration(750)
            .style('opacity', 1)
            .attrTween("transform", function (d): (t: number) => string {

                const parentX = d.parent.previousX;
                const parentY = d.parent.previousY;

                const interpolateSourceX = d3.interpolate(parentX, d.x);
                const interpolateSourceY = d3.interpolate(parentY, d.y);

                return function (t: number): string {
                    return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                };
            })
    }

    const handleDeleteCurrentTree = (node: D3Node) => {
        removeCurrentTree(node);
        treeStore.setCurrentMenu(null)
    };

    function handleAddNode(node: D3Node) {
        addNode(node);
        treeStore.setCurrentMenu(null)
    }

    function handDragNode() {


        const dragStart = {x: 0, y: 0};

        const dragBehavior = d3.drag<any, D3Node>()
            .on("start", function (event, d) {


                treeStore.setDraggingNode(d)


                if (d === rootNode.current) {
                    message.error("根节点不可拖拽").then(r => r)
                    return
                }
                // 记录拖拽开始时鼠标的位置
                dragStart.x = event.x;
                dragStart.y = event.y;

                const descendants = d.descendants();
                descendants.forEach(descendant => {
                    descendant.relativeX = descendant.x - d.x;
                    descendant.relativeY = descendant.y - d.y;
                });


            })
            .on("drag", function (event, d) {

                if (d === rootNode.current) {
                    message.error("根节点不可拖拽").then(r => r)
                    return
                }
                // 计算鼠标的相对移动距离
                const dx = event.x - dragStart.x;
                const dy = event.y - dragStart.y;
                d3.select(`#link-${d.data.id}`)
                    .transition()
                    .duration(30)
                    .style("opacity", 0)
                    .on("end", function () {
                        d3.select(this).remove();
                    });

                d.x = dragStart.x + dy;  // 垂直方向移动
                d.y = dragStart.y + dx;  // 水平方向移动

                d.descendants().forEach(descendant => {
                    descendant.x = d.x + descendant.relativeX;
                    descendant.y = d.y + descendant.relativeY;
                    d3.select(`#node-${descendant.data.id}`)
                        .attr("transform", `translate(${descendant.y},${descendant.x})`);
                });

                // 移动节点
                d3.select(this).attr("transform", `translate(${d.y},${d.x})`);

                d.descendants().forEach(descendant => {
                    const linkData = {source: descendant.parent, target: descendant} as D3Link;
                    d3.select(`#link-${descendant.data.id}`)
                        .attr("d", d3.linkHorizontal<D3Link, D3Node>().x(node => node.y).y(node => node.x)(linkData));

                })


                let closestNode = null;
                let minDistance = Infinity;
                rootNode.current.descendants().forEach(node => {
                    if (node !== d) {
                        //计算和其他节点的距离
                        const distance = Math.sqrt((d.x - node.x) ** 2 + (d.y - node.y) ** 2);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestNode = node;
                        }
                    }
                });

                if (closestNode && minDistance < 120) {
                    closestNodeRef.current = closestNode;
                    gRef.current!.select(".preview-line")
                        .style("opacity", 1)
                        // 画线
                        .attr("d", d3.line()([[d.y, d.x], [(closestNode as D3Node).y, (closestNode as D3Node).x]]));
                } else {
                    closestNodeRef.current = null;
                    gRef.current!.select(".preview-line")
                        .style("opacity", 0);
                }


            })
            .on("end", function (_event, d) {

                // 确保不是根节点
                if (d === rootNode.current) {
                    message.error("根节点不可拖拽").then(r => r);
                    return;
                }

                const closestNode = closestNodeRef.current;
                if (closestNode) {

                    const oldParentNode = d.parent!;

                    const parentChildren = oldParentNode.children;
                    if (parentChildren) {
                        oldParentNode.children = parentChildren.filter(child => child !== d);
                        if (oldParentNode.children.length === 0) {
                            //没有子节点了，删除children属性，给空数值会报错。d3会认为有children
                            delete oldParentNode.children;
                        }
                    }
                    if (oldParentNode.data.children) {

                        for (let i = 0; i < oldParentNode.data.children?.length; i++) {
                            if (oldParentNode.data.children[i].id === d.data.id) {
                                oldParentNode.data.children.splice(i, 1)
                            }
                        }
                    }

                    // 更新节点数据：设置新的父节点
                    d.parent = closestNode;

                    // 添加到新父节点的子节点中
                    if (!closestNode.children) {
                        closestNode.children = [];
                    }
                    // 递归更新节点深度
                    updateNodeDepth(d, closestNode.depth + 1);

                    closestNode.children.push(d);

                    if (!closestNode.data.children) {
                        closestNode.data.children = [];
                    }
                    closestNode.data.children.push(d.data);

                    refresh();

                    // 清除预览线和其他状态
                    gRef.current!.select(".preview-line").style("opacity", 0);
                    closestNodeRef.current = null;

                    setTimeout(() => {
                        treeStore.setDraggingNode(null)
                    }, 1000);

                }
            });
        gRef.current!.selectAll<SVGGElement, D3Node>(".node").call(dragBehavior);


    }

    const nodeActions = [
        {
            icon: <SmileFilled className={TreeChartStyles.icon}/>,
            label: '添加节点',
            action: () => handleAddNode(treeStore.menuNode!)
        },
        {
            icon: <SmileFilled className={TreeChartStyles.icon}/>,
            label: '删除当前树',
            action: () => handleDeleteCurrentTree(treeStore.menuNode!)
        },
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        // 为不同的操作添加不同的图标
    ];


    const menuContent = (

        <div className={TreeChartStyles.nodePopup}>
            {nodeActions.map((nodeAction, index) => (
                <div key={index} className={TreeChartStyles.node} onClick={nodeAction.action}>
                    {nodeAction.icon}
                    <span className={TreeChartStyles.span}>
                        {nodeAction.label}
                    </span>
                </div>
            ))}
        </div>
    );


    useEffect(() => {

        console.log(svgRef.current)
        if (!svgRef.current) return;

        svgSelect.current = d3.select(svgRef.current)
        // treeStore
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
                currentTransform.current = event.transform;
                treeGroup.attr('transform', event.transform);
            })

        svgSelect.current!.call(zoomBehavior);
        svgSelect.current!.call(zoomBehavior.transform, d3.zoomIdentity.translate(x, y).scale(1)); // 设置初始缩放和平移
        //很容易双击，所以先取消双击事件
        svgSelect.current!.on("dblclick.zoom", null);

        DrawLinks(gRef.current,rootNode.current);
        DrawCircle(gRef.current,rootNode.current,svgRef.current,treeStore);

    }, [initialData, treeStore]);


    return (
        <div>
            <svg ref={svgRef} width="2300" height="1200">
                <MovingArrowPattern/>
            </svg>

            {/* 编辑器 */}
            <ManageModalEditor treeStore={treeStore}/>
            {/*悬浮菜单*/}

            {treeStore.menuPosition != null && <div
                style={{
                    position: 'absolute',
                    left: treeStore.menuPosition.x,
                    top: treeStore.menuPosition.y,
                }}
            >
                <Popover content={menuContent} open={!treeStore.draggingNode}>
                </Popover>
            </div>}


        </div>
    );
});

export default TreeChart;
