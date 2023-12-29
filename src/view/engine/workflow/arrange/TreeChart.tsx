import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {v4 as uuid} from 'uuid'
import MovingArrowPattern from "../../../../components/d3Helpers/MovingArrowPattern.tsx";
import { message, Modal, Popover} from "antd";
import ManageEditor from '../../../../components/editor/ManageEditor.tsx';
import TreeChartStyles from './TreeChart.module.scss'
import {SmileFilled} from "@ant-design/icons";
import ModalFooter from "../../../../components/editor/ModalFooter.tsx";
import {centerTree} from "../../../../components/d3Helpers/treeHelpers.ts";


export interface NodeData {
    id: string;
    name: string;
    scriptText: string;
    nodeType: string;
    children?: NodeData[];
}

export interface D3Node extends d3.HierarchyNode<NodeData> {
    relativeX: number;
    relativeY: number;
    x: number;
    y: number;
    depth: number;
    height: number;

    previousX?: number;
    previousY?: number;
}

export interface D3Link extends d3.HierarchyLink<NodeData> {
    source: D3Node;
    target: D3Node;
    parent?: {
        x: number;
        y: number;
    }
    x?: number;
    y?: number;
}

// 中心化树


const TreeChart: React.FC<NodeData> = (initialData) => {

    const svgRef = useRef(null);
    const svgSelect = useRef<d3.Selection<any, any, any, any> | null>(null);
    const gRef = useRef<d3.Selection<any, any, any, any> | null>(null);
    // const [rootNode] = useState(d3.hierarchy(initialData) as D3Node);
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
    const [menuVisible, setMenuVisible] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
    const [menuNode, setMenuNode] = useState<D3Node | null>(null);
    const [clickNode, setClickNode] = useState<D3Node | null>(null);
    const closestNodeRef = useRef<D3Node | null>();

    function buildCircle(nodesEnter: d3.Selection<SVGGElement, D3Node, any, any>) {
        nodesEnter.append("circle")
            .attr("r", 20)
            .style("fill", "#c0f1b0") // 设置初始化灰白色，掩盖连接线
            .style("stroke", "#999")
            .style("stroke-width", 1.5)
            .style("opacity", 1)
            .raise()

            .on('mouseover', function (_event, node) {
                const circleRadius = 10; // 圆的半径
                const popoverHeight = 10; // Popover 的高度
                // const popoverWidth = 10; // 假设的 Popover 宽度

                // 获取当前的缩放变换
                const transform = d3.zoomTransform(svgRef.current!);

                // 计算变换后的位置
                const transformedX = transform.applyX(node.y);
                const transformedY = transform.applyY(node.x) - circleRadius - popoverHeight;

                const boundingClientRect = (svgRef.current! as SVGGElement).getBoundingClientRect();

                // 计算 Popover 在文档中的位置
                const x = boundingClientRect.left + window.scrollX + transformedX; // 调整 X 坐标
                // const x = boundingClientRect.left + window.scrollX + transformedX - popoverWidth / 2; // 调整 X 坐标
                const y = boundingClientRect.top + window.scrollY + transformedY;

                d3.select(this)
                    .transition()
                    .duration(5)
                    .attr("r", 25)
                    .style("fill", "#a9db80");
                setMenuVisible(false);

                setTimeout(() => {
                    setMenuPosition({x: x, y: y});
                    setMenuVisible(true);
                    setMenuNode(node);
                }, 1);
            })
            .on('mouseout', function () {
                d3.select(this) // 选择当前的圆
                    .transition() // 开始一个过渡效果
                    .duration(50) // 持续时间
                    .attr("r", 20) // 恢复圆的半径
                    .style("fill", "#c0f1b0"); // 恢复填充色
            })
            .on('click', function (_event, d) {
                d3.select(this)
                    .transition()
                    .duration(50) // 闪烁效果快速发生
                    .style('fill', '#a1c26f') // 临时变为新颜色
                    .transition()
                    .duration(10)
                    .style('fill', '#c0f1b0'); // 然后迅速变回原色
                // 继续执行添加节点的函数或其他操作
                setClickNode(d);
            })
            .on('contextmenu', function (event, ) {
                event.preventDefault(); // 阻止默认的右键菜单

            });

        nodesEnter.append("text")
            .attr("dy", "-2em")
            .attr("x", 0)
            .style("text-anchor", "middle")
            // .style("pointer-events", "none") 取消所有事件
            .text(d => d.data.name)
            .on('mouseover', function () {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .style("fill", "#000") // 鼠标悬停时的文本颜色
                    .style("font-weight", "bold"); // 文字加粗
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(250)
                    .style("fill", "#555") // 恢复默认文本颜色
                    .style("font-weight", "normal"); // 文字恢复正常
            });
    }

    function DrawCircle() {

        const nodeSelection = gRef.current!.selectAll<SVGGElement, D3Node>(".node");
        const nodes = nodeSelection.data(rootNode.current.descendants(), d => d.data.id);
        const nodesEnter: d3.Selection<SVGGElement, D3Node, any, any> = nodes.enter()
            .append("g")
            .attr("class", "node")

            .attr("transform", d => {
                //新节点移动到新位置
                return `translate(${d.y},${d.x})`
            })
            .attr('id', d => `node-${d.data.id}`);  // 同时设置ID，用于后续选择
        buildCircle(nodesEnter);

        nodes.transition()
            .duration(750)
            .attr("transform", d => {
                return `translate(${d.y},${d.x})`
            });
    }

    function update() {
        rootNode.current.descendants().forEach(d => {

            d.previousX = d.x
            d.previousY = d.y
        });


        const root = rootNode.current;
        console.log("data", JSON.stringify(root.data))
        treeLayout.current(root);
        gRef.current!.attr("transform", currentTransform.current!.toString());

        DrawLinks()
        DrawCircle();
    }


    function removeNode(nodeToRemove: D3Node) {
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

        setTimeout(update, 750);
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
        update();
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

    const handleDeleteNode = (node: D3Node) => {
        removeNode(node);
        setMenuVisible(false); //
    };

    function handleAddNode(node: D3Node) {
        addNode(node);
        setMenuVisible(false); // 关闭菜单
    }

    function handDragNode() {


        const dragStart = {x: 0, y: 0};

        const dragBehavior = d3.drag<any, D3Node>()
            .on("start", function (event, d) {


                setDragging(true)
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
                setDragging(true)
                if (d === rootNode.current) {
                    message.error("根节点不可拖拽").then(r => r)
                    return
                }
                // 计算鼠标的相对移动距离
                const dx = event.x - dragStart.x;
                const dy = event.y - dragStart.y;
                d3.select(`#link-${d.data.id}`)
                    .transition()
                    .duration(100)
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

                    update();

                    // 清除预览线和其他状态
                    gRef.current!.select(".preview-line").style("opacity", 0);
                    closestNodeRef.current = null;

                    setTimeout(() => {
                        setDragging(false)
                    }, 1000);

                }
            });
        gRef.current!.selectAll<SVGGElement, D3Node>(".node").call(dragBehavior);


    }

    const nodeActions = [
        {
            icon: <SmileFilled className={TreeChartStyles.icon}/>,
            label: '添加节点',
            action: () => handleAddNode(menuNode!)
        },
        {
            icon: <SmileFilled className={TreeChartStyles.icon}/>,
            label: '删除节点',
            action: () => handleDeleteNode(menuNode!)
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


    function DrawLinks() {
        const selection = gRef.current!.selectAll<SVGPathElement, D3Link>(".link");
        const links = selection.data(rootNode.current.links() as D3Link[], d => {
            return d.target.data.id
        });


        links.enter()
            .append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "url(#movingArrowPattern)")//自定义连接线的样式。
            .attr("stroke-width", 10)
            .attr('id', d => `link-${d.target.data.id}`) // 同时设置ID，用于后续选择
            .lower()
            .transition()
            .duration(750)
            // 新的连接线的动画效果，感觉可以在这里解决连接线断掉的问题
            .attrTween("d", function (d): (t: number) => string {
                // 插值生成器
                let nodePreviousPosition: number[] | null = null;
                const node = rootNode.current.descendants().find(node => node.data.id === d.source.data.id);
                if (node?.previousX && node?.previousY) {
                    nodePreviousPosition = [node.previousX, node.previousY];
                }


                if (nodePreviousPosition == null) {

                    return function (t: number): string {
                        const interpolateY = d3.interpolate(d.source.y, d.target.y);
                        const interpolateX = d3.interpolate(d.source.x, d.target.x);

                        const tempD: D3Link = {
                            source: {x: d.source.x, y: d.source.y} as D3Node,
                            target: {x: interpolateX(t), y: interpolateY(t)} as D3Node,
                        };

                        return d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)(tempD)!;
                    };

                } else {

                    const previousY = nodePreviousPosition[1];
                    const previousX = nodePreviousPosition[0];
                    const interpolateY = d3.interpolate(previousY, d.target.y);
                    const interpolateX = d3.interpolate(previousX, d.target.x);

                    const sourceY = d3.interpolate(previousY, d.source.y);
                    const sourceX = d3.interpolate(previousX, d.source.x);


                    return function (t: number): string {
                        // t 是从 0 到 1 的过渡状态
                        // 计算新的目标位置
                        const newY = interpolateY(t);
                        const newX = interpolateX(t);

                        // 临时更新 d.target 的位置
                        const tempD: D3Link = {
                            source: {x: sourceX(t), y: sourceY(t)} as D3Node,
                            target: {x: newX, y: newY} as D3Node,
                        };

                        return d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)(tempD)!;
                    };
                }

            });

        //写上这段代码，删掉节点的时候。连接线也删除了
        links.exit().remove();
        // 旧的连接线的动画效果
        links.transition()
            .duration(750)
            .attr("d", d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x));
    }

    useEffect(() => {

        if (!svgRef.current) return;
        svgSelect.current = d3.select(svgRef.current)
        gRef.current = svgSelect.current.append("g");
        d3.select('body').on('click', () => {
            // 点击页面任何其他地方时隐藏菜单
            setMenuVisible(false);
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
                setMenuVisible(false); // 关闭菜单
                currentTransform.current = event.transform;
                treeGroup.attr('transform', event.transform);
            })

        svgSelect.current!.call(zoomBehavior);
        svgSelect.current!.call(zoomBehavior.transform, d3.zoomIdentity.translate(x, y).scale(1)); // 设置初始缩放和平移

        //很容易双击，所以先取消双击事件
        svgSelect.current!.on("dblclick.zoom", null);
        //划线
        DrawLinks();
        DrawCircle()


    }, [initialData]);


    return (
        <div>
            <svg ref={svgRef} width="2300" height="1200">
                <MovingArrowPattern/>
            </svg>

            <Modal
                title="Modal 1000px width"
                centered
                maskClosable={false}
                open={clickNode != null}
                onCancel={() => setClickNode(null)}
                width={900}
                footer={<ModalFooter clickNode={clickNode} setClickNode={setClickNode} />}
            >
                <div style={{
                    border: '1px solid #e1e4e8', // 浅灰色边框
                    background: '#f6f8fa', // 轻微的背景色
                    borderRadius: '4px', // 轻微的圆角
                    padding: '10px', // 内边距
                }}>
                    <ManageEditor/>
                </div>

            </Modal>
            {/*悬浮菜单*/}
            <div
                style={{
                    position: 'absolute',
                    left: menuPosition.x,
                    top: menuPosition.y,
                }}
            >
                <Popover content={menuContent} open={menuVisible && !dragging}>
                </Popover>
            </div>


        </div>
    )
}

export default TreeChart;
