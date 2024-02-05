// NodeMenu.tsx
import React from 'react';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    DragOutlined,
    FileOutlined,
    PlusCircleOutlined,
    ShrinkOutlined
} from "@ant-design/icons";
import {message, Popover} from "antd";
import NodeMenuStyles from './styles/D3node.module.scss';
import {TreeStore} from "@/store/TreeStore.ts";
import * as d3 from "d3";
import {Transition} from "d3";
import {D3Link, D3Node, NodeData, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {generateLinkId, refresh} from "@/components/D3Node/TreeChartDrawing.ts";
import {observer} from "mobx-react";
import {END_NODE_LENGTH, GenerateUUID} from "@/components/d3Helpers/treeHelpers.ts";

interface NodeAction {
    icon: React.JSX.Element;
    label: string;
    nodeType?: string;
    disabled?: boolean;
    action: () => void;
}

interface NodeMenuProps {
    treeStore: TreeStore;
    treeChartState: TreeChartState
}


const NodeMenu: React.FC<NodeMenuProps> = observer(({treeStore, treeChartState}) => {
    const menuPosition = treeStore.menuPosition;
    let siderWidth = treeStore.siderWidth;
    const rootNode = treeChartState.rootNode;
    const gRef = treeChartState.gRef;
    // treeStore.


    if (!menuPosition || treeStore.clickNode) return null; // 如果没有位置信息，则不渲染菜单
    function handleDeleteCurrentTree(nodeToRemove: D3Node) {

        if (nodeToRemove.parent == null) {
            message.error('根节点无法删除').then(r => r)
            return
        }

        const descendants = nodeToRemove.descendants();
        const descendantIds = new Set(descendants.map(d => d.data.scriptId));

        // 选中所有要移除的节点和连接线
        const nodesToRemove = gRef.selectAll<SVGCircleElement, D3Node>('.node')
            .filter(function (d: D3Node) {
                return descendantIds.has(d.data.scriptId);
            });
        const linksToRemove = gRef.selectAll<SVGCircleElement, D3Link>('.link')
            .filter((d: D3Link) => {
                return descendantIds.has(d.target.data.scriptId);
            });

        // 应用过渡效果，使节点和连接线渐渐消失
        nodesToRemove.transition().duration(750)
            .style('opacity', 0)
            .attr("transform", `translate(${nodeToRemove.parent.y},${nodeToRemove.parent.x})`)
            .remove();

        removeLink(linksToRemove.transition().duration(750), nodeToRemove);


        const parentChildren = nodeToRemove.parent.children;
        if (parentChildren) {
            nodeToRemove.parent.children = parentChildren.filter(child => child !== nodeToRemove);
            if (nodeToRemove.parent.children.length === 0) {
                delete nodeToRemove.parent.children;
            }
        }
        if (nodeToRemove.parent.data.children) {

            for (let i = 0; i < nodeToRemove.parent.data.children?.length; i++) {
                if (nodeToRemove.parent.data.children[i].scriptId === nodeToRemove.data.scriptId) {
                    nodeToRemove.parent.data.children.splice(i, 1)
                }
            }
        }


        setTimeout(() => {
            refresh(treeChartState);
        }, 500);
    }

    function handleAddNode(clickedNode: D3Node, nodeType: string) {

        const newNodeData: NodeData =
            {

                scriptId: GenerateUUID(),
                scriptName: nodeType === "End" ? "" : "New Node" + Math.floor(Math.random() * 90) + 100,
                scriptType: nodeType,
                scriptDesc: "",
                scriptText: '',
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

        refresh(treeChartState);

        const nodesEnter = gRef.select<SVGGElement>(`#node-${newNodeData.scriptId}`);
        nodesEnter.transition()
            .duration(750)
            .style('opacity', 1)
            .attrTween("transform", function (d): (t: number) => string {

                const parentX = d.parent.previousX;
                const parentY = d.parent.previousY;

                const interpolateSourceX = d3.interpolate(parentX, d.x);

                let interpolateSourceY = d3.interpolate(parentY, d.y);
                if (nodeType === "End") {
                    interpolateSourceY = d3.interpolate(parentY, d.y - END_NODE_LENGTH);
                }

                return function (t: number): string {
                    return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                };
            })

    }


    function removeLink(transition: Transition<SVGCircleElement, D3Link, any, any>, nodeToRemove: D3Node) {
        transition.style('opacity', 0)
            .attrTween("d", function (d): (t: number) => string {
                const o = {x: nodeToRemove.parent!.x, y: nodeToRemove.parent!.y}; // 父节点的位置


                const interpolateSourceX = d3.interpolate(d.source.x, o.x);
                const interpolateSourceY = d3.interpolate(d.source.y, o.y);
                const interpolateTargetX = d3.interpolate(d.target.x, o.x);
                const interpolateTargetY = d3.interpolate(d.target.data.scriptType === 'End' ? d.target.y - END_NODE_LENGTH : d.target.y, o.y);


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
                    return d3.linkHorizontal<D3Link, D3Node>().x(function (d) {
                        return d.y;
                    }).y(d => d.x)(spreadElements)!;
                };
            })
            .on('end', function () {
                d3.select(this).remove(); // 在动画结束后移除链接
            });
    }

    // @ts-ignore
    function removeNodeAndLinks(nodeToRemove: D3Node) {
        const nodesEnter = gRef.select<SVGGElement>(`#node-${nodeToRemove.data.scriptId}`);
        // 视图上移除和这个节点相关的node 和link
        nodesEnter.transition().duration(500)
            .style('opacity', 0)
            .attr("transform", `translate(${nodeToRemove.parent!.y},${nodeToRemove.parent!.x})`)
            .on('end', function () {
                d3.select(this).remove(); // 在动画结束后移除节点
            });


        const linksToRemove = gRef.selectAll<SVGCircleElement, D3Link>('.link')
            .filter((d: D3Link) => {
                return d.source.data.scriptId === nodeToRemove.data.scriptId || d.source.data.scriptId === nodeToRemove.data.scriptId;
            });//这里还可以改名link

        const transition = linksToRemove.transition().duration(500);
        removeLink(transition, nodeToRemove);

    }

    function handleDeleteNode(nodeToRemove: D3Node) {
        if (!nodeToRemove.parent) {
            message.error('根节点无法删除').then(r => r);
            return;
        }
        // removeNodeAndLinks(nodeToRemove);

        const nodesEnter = gRef.select<SVGGElement>(`#node-${nodeToRemove.data.scriptId}`);
        // 视图上移除和这个节点相关的node 和link
        nodesEnter.transition().duration(500)
            .style('opacity', 0)
            .attr("transform", `translate(${nodeToRemove.parent!.y},${nodeToRemove.parent!.x})`)
            .on('end', function () {
                d3.select(this).remove(); // 在动画结束后移除节点
            });


        // 2. 处理动画和样式
        if (nodeToRemove.children && nodeToRemove.children.length >= 1) {
            // 重新定位第一个子节点和其子孙节点
            const firstChild = nodeToRemove.children[0];

            let selection = d3.select<SVGPathElement, D3Link>(`#${generateLinkId(nodeToRemove.parent.data.scriptId, nodeToRemove.data.scriptId)}`);
            selection.attr("id", `${generateLinkId(nodeToRemove.parent.data.scriptId, firstChild.data.scriptId)}`)

            d3.select(`#${generateLinkId(nodeToRemove.data.scriptId, firstChild.data.scriptId)}`)
                .transition().duration(600).style('opacity', 0).remove();


            nodeToRemove.children.forEach(child => {
                if (child !== firstChild) {
                    let selection = d3.select<SVGPathElement, D3Link>(`#${generateLinkId(nodeToRemove.data.scriptId, child.data.scriptId)}`);
                    selection.attr("id", `${generateLinkId(firstChild.data.scriptId, child.data.scriptId)}`)
                }

            })


            const nodesEnter = gRef.select<SVGGElement>(`#node-${firstChild.data.scriptId}`);

            nodesEnter.transition()
                .duration(650)
                // .style('opacity', 1)
                .attrTween("transform", function (d): (t: number) => string {

                    const interpolateSourceX = d3.interpolate(d.x, nodeToRemove.x);
                    const interpolateSourceY = d3.interpolate(d.y, nodeToRemove.y);
                    return function (t: number): string {
                        return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                    };
                })
        } else {
            d3.select(`#${generateLinkId(nodeToRemove.parent.data.scriptId, nodeToRemove.data.scriptId)}`)
                .transition().duration(450).style('opacity', 0).remove();
        }


        const parentChildren = nodeToRemove.parent.children;
        if (parentChildren) {
            // 检查nodeToRemove是否有子节点
            if (nodeToRemove.children && nodeToRemove.children.length > 0) {
                // 获取nodeToRemove的第一个子节点
                const firstChild = nodeToRemove.children[0];
                // 这个非常重要！！！！！！！！！！！！！
                updateNodeDepth(firstChild, firstChild.depth - 1);

                // 用第一个子节点替换nodeToRemove
                nodeToRemove.parent.children = parentChildren.map(child =>
                    child === nodeToRemove ? firstChild : child);

                //   如果nodeToRemove有多个子节点，则将其余子节点添加到替换节点的children数组
                if (nodeToRemove.children.length > 1) {
                    const remainingChildren = nodeToRemove.children.slice(1);
                    firstChild.children = firstChild.children ? firstChild.children.concat(remainingChildren) : remainingChildren;

                    // 更新剩余子节点的parent属性
                    remainingChildren.forEach(child => {
                        child.parent = firstChild;
                    });
                }

                // 更新替换节点的parent属性
                firstChild.parent = nodeToRemove.parent;


            } else {
                // 如果nodeToRemove没有子节点，正常移除

                nodeToRemove.parent.children = parentChildren.filter(child => child !== nodeToRemove);

                if (nodeToRemove.parent.children.length === 0) {
                    delete nodeToRemove.parent.children;
                }

            }
        }
        //
        if (nodeToRemove.data.children && nodeToRemove.data.children.length > 0) {
            // 获取 nodeToRemove 的第一个子节点的数据
            const firstChildData = nodeToRemove.data.children[0];

            // 如果 nodeToRemove 有更多的子节点，将它们的数据添加到 firstChildData 的子节点数据列表中
            if (nodeToRemove.data.children.length > 1) {
                const remainingChildrenData = nodeToRemove.data.children.slice(1);
                firstChildData.children = (firstChildData.children || []).concat(remainingChildrenData);
            }

            // 更新 nodeToRemove.parent.data.children 数组
            const parentDataChildren = nodeToRemove.parent.data.children;

            const nodeIndex = parentDataChildren!.findIndex(child => child.scriptId === nodeToRemove.data.scriptId);
            if (nodeIndex !== -1) {
                parentDataChildren!.splice(nodeIndex, 1, firstChildData);
            }

        } else {
            // 如果 nodeToRemove 没有子节点，正常移除
            const parentDataChildren = nodeToRemove.parent.data.children;
            const nodeIndex = parentDataChildren!.findIndex(child => child.scriptId === nodeToRemove.data.scriptId);
            if (nodeIndex !== -1) {
                parentDataChildren!.splice(nodeIndex, 1);
            }
        }
        //这里设置延时是为了 前面的一些删除操作有延时。要等前面的操作完毕之后再更新 不然会被覆盖
        setTimeout(() => {
            refresh(treeChartState);
        }, 750);


    }

    const menuNode = treeStore.menuNode;

    const isEndNodeType = menuNode?.data.scriptType === "End";
    const isStartNodeType = menuNode?.data.scriptType === "Start";
    const nextNodeIsEnd = isNextNodeEnd(treeStore.menuNode);
    const hasChildren = !!(menuNode && menuNode.data.children && menuNode.data.children.length > 0);
    const hasEndChildNode = !!(menuNode && menuNode.data.children && menuNode.data.children.some(child => child.scriptType === 'End'));

    function handleScriptNode(clickedNode: D3Node, stringType: string) {
        const uuid = GenerateUUID();
        const newNodeData: NodeData = {

            scriptId: uuid,
            scriptName: `New ${stringType} Node:` + uuid.split('-').pop(),
            scriptType: stringType,
            scriptDesc: "",
            scriptText: '',
        };

        // 2. 创建新节点B，并设置其为clickedNode(A)的子节点
        const newNode = d3.hierarchy(newNodeData, (d) => d.children) as D3Node;
        newNode.depth = clickedNode.depth + 1;
        newNode.parent = clickedNode;

        // 3. 转移A的现有子节点到B下
        if (clickedNode.children) {
            newNode.children = clickedNode.children;
            newNode.children.forEach(child => {
                child.parent = newNode
                updateNodeDepth(child, newNode.depth + 1); // 更新深度的函数
            });
        }


        clickedNode.children = [newNode];


        if (!clickedNode.data.children) {
            clickedNode.data.children = [];
        }
        clickedNode.data.children = [newNodeData];

        // 5. 如果有必要，更新新节点B的数据结构以反映其子节点
        newNodeData.children = newNode.children ? newNode.children.map(child => child.data) : [];


        newNodeData.children.forEach(child => {
            let selection = d3.select<SVGPathElement, D3Link>(`#${generateLinkId(clickedNode.data.scriptId, child.scriptId)}`);
            selection.attr("id", `${generateLinkId(newNode.data.scriptId, child.scriptId)}`)
        })

        refresh(treeChartState);
        //
        // if (!newNodeData.children || newNodeData.children.length === 0) {
        //     let selection = d3.select<SVGPathElement, D3Link>(`#${generateLinkId(clickedNode.data.scriptId, newNodeData.scriptId)}`);
        //     selection.transition().duration(750).style('opacity', 1)
        //         .attrTween("d", function (d): (t: number) => string {
        //
        //             const interpolateSourceX = d3.interpolate(d.source.previousX!, d.source.x);
        //             const interpolateSourceY = d3.interpolate(d.source.y, d.source.y);
        //             const interpolateTargetX = d3.interpolate(d.source.x,  d.source.x);
        //             // const interpolateTargetY = d3.interpolate(d.target.data.scriptType === 'End' ? d.target.y - END_NODE_LENGTH : d.target.y, o.y);
        //             const interpolateTargetY = d3.interpolate( d.source.y, d.target.y);
        //
        //
        //             return function (t: number): string {
        //                 // 计算当前插值状态
        //                 const sourceX = interpolateSourceX(t);
        //                 const sourceY = interpolateSourceY(t);
        //                 const targetX = interpolateTargetX(t);
        //                 const targetY = interpolateTargetY(t);
        //
        //                 // 返回当前的路径
        //                 const spreadElements: D3Link = {
        //                     source: {x: sourceX, y: sourceY} as D3Node,
        //                     target: {x: targetX, y: targetY} as D3Node
        //                 };
        //                 return d3.linkHorizontal<D3Link, D3Node>().x(function (d) {
        //                     return d.y;
        //                 }).y(d => d.x)(spreadElements)!;
        //             };
        //         })
        // }


        const nodesEnter = gRef.select<SVGGElement>(`#node-${newNodeData.scriptId}`);

        nodesEnter.transition()
            .duration(750)
            .style('opacity', 1)
            .attrTween("transform", function (d): (t: number) => string {

                let interpolateSourceX = d3.interpolate(clickedNode.previousX, d.x);
                let interpolateSourceY = d3.interpolate(d.parent.y, d.y);
                if (d.data.scriptType === "End") {
                    return function (t: number): string {
                        return `translate(${interpolateSourceY(t)},${d.x})`;
                    };
                }//不知道这段话有没有用。先注释掉
                return function (t: number): string {
                    return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                };
            });

    }

    const nodeActions: NodeAction[] = [
        // 添加代码节点
        {
            icon: <PlusCircleOutlined className={NodeMenuStyles.icon}/>,
            label: '添加代码节点',
            nodeType: "Script",
            disabled: isEndNodeType,
            action: () => handleScriptNode(treeStore.menuNode!, "Script")
        },
        // 条件节点
        {
            icon: <CheckCircleOutlined className={NodeMenuStyles.icon}/>,
            label: '条件节点todo',
            nodeType: "Condition",
            disabled: isEndNodeType || (hasChildren && nextNodeIsEnd),
            action: () => handleAddNode(treeStore.menuNode!, "Condition")
        },
        // 规则节点
        {
            icon: <ShrinkOutlined className={NodeMenuStyles.icon}/>,
            label: '规则节点todo',
            nodeType: "Rule",
            disabled: isEndNodeType || (hasChildren && nextNodeIsEnd),
            action: () => handleScriptNode(treeStore.menuNode!, "Rule")
        },
        // 删除节点树
        {
            icon: <DeleteOutlined className={NodeMenuStyles.icon}/>,
            label: '删除节点树',
            nodeType: "DeleteTree",
            disabled: isEndNodeType || isStartNodeType,
            action: () => handleDeleteCurrentTree(treeStore.menuNode!)
        },
        // 删除当前节点
        {
            icon: <DeleteOutlined className={NodeMenuStyles.icon}/>,
            label: '删除当前节点',
            nodeType: "Delete",
            disabled: hasEndChildNode || isStartNodeType,
            action: () => handleDeleteNode(treeStore.menuNode!)
        },
        // 结束节点
        {
            icon: <CloseCircleOutlined className={NodeMenuStyles.icon}/>,
            label: '结束节点',
            nodeType: "End",
            disabled: hasChildren || isEndNodeType,
            action: () => handleAddNode(treeStore.menuNode!, 'End')
        },
        // 拖拽节点
        {
            icon: <DragOutlined className={NodeMenuStyles.icon}/>,
            label: '拖拽节点',
            nodeType: "drag",
            disabled: isEndNodeType || isStartNodeType,
            action: () => handDragNode()
        },
        // json批量创建节点
        {
            icon: <FileOutlined className={NodeMenuStyles.icon}/>,
            label: 'json批量创建节点',
            disabled: isEndNodeType || nextNodeIsEnd,
            action: () => handDragNode()
        }
    ];

    function updateNodeDepth(node: D3Node, newDepth: number) {
        node.depth = newDepth;
        if (node.children) {
            node.children.forEach(child => updateNodeDepth(child, newDepth + 1));
        }
    }


    function handDragNode() {

        const dragStart = {x: 0, y: 0};
        const dragBehavior = d3.drag<any, D3Node>()
            .on("start", function (event, d) {


                if (d === rootNode) {
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
                treeStore.setDraggingNode(d)
                if (d === rootNode) {
                    message.error("根节点不可拖拽").then(r => r)
                    return
                }
                // 计算鼠标的相对移动距离
                const dx = event.x - dragStart.x;
                const dy = event.y - dragStart.y;
                d3.select(`#${generateLinkId(d.parent!.data.scriptId, d.data.scriptId)}`)
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
                    d3.select(`#node-${descendant.data.scriptId}`)
                        .attr("transform", descendant.data.scriptType == "End" ? `translate(${descendant.y - END_NODE_LENGTH},${descendant.x})` : `translate(${descendant.y},${descendant.x})`);
                });

                // 移动节点
                d3.select(this).attr("transform", `translate(${d.y},${d.x})`);

                // d.descendants().forEach(descendant => {
                //     const linkData = {source: descendant.parent, target: descendant} as D3Link;
                //     d3.select(`#${generateLinkId(linkData.source.data.id, linkData.target.data.id)}`)
                //         .attr("d", function() {
                //             const sourceX = linkData.source.x;
                //             const sourceY = linkData.source.y;
                //             const targetX = linkData.target.x;
                //             let targetY = linkData.target.y;
                //
                //             if (descendant.data.nodeType === "End") {
                //                 // 如果目标节点是 'End' 类型，调整连接线的结束点位置
                //                 targetY -= END_LENGTH; // 这里减去一个固定长度
                //             }
                //
                //             // 使用定制的绘制函数
                //             return `M${sourceY},${sourceX}C${(sourceY + targetY) / 2},${sourceX} ${(sourceY + targetY) / 2},${targetX} ${targetY},${targetX}`;
                //         });
                // });

                d.descendants().forEach(descendant => {
                    const linkData = {source: descendant.parent, target: descendant} as D3Link;
                    d3.select(`#${generateLinkId(linkData.source.data.scriptId, linkData.target.data.scriptId)}`)
                        .attr("d", function () {
                            if (descendant.data.scriptType === "End") {
                                // 如果目标节点是 'End' 类型，调整连接线的长度
                                const intermediatePointY = linkData.target.y - END_NODE_LENGTH;
                                const modifiedTarget = {x: linkData.target.x, y: intermediatePointY} as D3Node;

                                // 使用 d3.linkHorizontal() 但是用修改后的目标点
                                return d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)({
                                    source: linkData.source,
                                    target: modifiedTarget
                                });
                            } else {
                                // 否则，保持原样
                                return d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)(linkData);
                            }
                        });
                });


                let closestNode = null;
                let minDistance = Infinity;
                rootNode.descendants().forEach(node => {
                    if (node !== d && node.data.scriptType !== "End") {
                        //计算和其他节点的距离
                        const distance = Math.sqrt((d.x - node.x) ** 2 + (d.y - node.y) ** 2);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestNode = node;
                        }
                    }
                });

                if (closestNode && minDistance < 120) {
                    treeChartState.closestNodeRef = closestNode;
                    gRef!.select(".preview-line")
                        .style("opacity", 1)
                        // 画线
                        .attr("d", d3.line()([[d.y, d.x], [(closestNode as D3Node).y, (closestNode as D3Node).x]]));
                } else {
                    treeChartState.closestNodeRef = null;
                    gRef!.select(".preview-line")
                        .style("opacity", 0);
                }


            })
            .on("end", function (_event, d) {

                // 确保不是根节点
                if (d === rootNode) {
                    message.error("根节点不可拖拽").then(r => r);
                    return;
                }

                const closestNode = treeChartState.closestNodeRef;
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
                            if (oldParentNode.data.children[i].scriptId === d.data.scriptId) {
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

                    refresh(treeChartState);

                    // 清除预览线和其他状态
                    gRef.select(".preview-line").style("opacity", 0);
                    treeChartState.closestNodeRef = null;

                    // setTimeout(() => {
                    // treeStore.setDraggingNode(null)
                    // }, 1000);
                    treeStore.setDraggingNode(null)
                    //拖拽结束。禁用拖拽
                    gRef.selectAll<SVGGElement, D3Node>(".node").on('.drag', null);
                }
            });
        gRef.selectAll<SVGGElement, D3Node>(".node").call(dragBehavior);


    }

    function isNextNodeEnd(menuNode: D3Node | null) {
        const children = menuNode?.data.children;
        return !!(children && children.length > 0 && children[0].scriptType === "End");

    }

    return (
        <div style={{position: 'absolute', left: menuPosition.x - siderWidth, top: menuPosition.y}}>
            <Popover content={(
                <div className={NodeMenuStyles.nodePopup}>
                    {nodeActions.map((nodeAction, index) => (
                        <div key={index}
                             className={`${NodeMenuStyles.node} ${nodeAction.disabled ? NodeMenuStyles.disabled : ''}`}
                             onClick={!nodeAction.disabled ? nodeAction.action : undefined}>
                            {nodeAction.icon}
                            <span className={NodeMenuStyles.nodeLabel}>{nodeAction.label}</span>
                        </div>
                    ))}
                </div>
            )} open={treeStore.draggingNode == null}>
            </Popover>
        </div>
    );


});

export default NodeMenu;
