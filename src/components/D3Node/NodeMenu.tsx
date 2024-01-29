// NodeMenu.tsx
import React from 'react';
import {SmileFilled} from "@ant-design/icons";
import {message, Popover} from "antd";
import NodeMenuStyles from './styles/D3node.module.scss';
import {TreeStore} from "@/store/TreeStore.ts";
import * as d3 from "d3";
import {D3Link, D3Node, NodeData, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {generateLinkId, refresh} from "@/components/D3Node/TreeChartDrawing.ts";
import {observer} from "mobx-react";
import {GenerateUUID} from "@/components/d3Helpers/treeHelpers.ts";

interface NodeAction {
    icon: React.JSX.Element;
    label: string;
    nodeType?: string;
    action: () => void;
}

interface NodeMenuProps {
    treeStore: TreeStore;
    treeChartState: TreeChartState
}


const NodeMenu: React.FC<NodeMenuProps> = observer(({treeStore, treeChartState}) => {
    const menuPosition = treeStore.menuPosition;
    const rootNode = treeChartState.rootNode;
    const gRef = treeChartState.gRef;


    if (!menuPosition) return null; // 如果没有位置信息，则不渲染菜单
    function handleDeleteCurrentTree(nodeToRemove: D3Node) {
        console.log("handleDeleteCurrentTree", nodeToRemove)
        // 找到所有子孙节点
        if (nodeToRemove.parent == null) {
            message.error('根节点无法删除').then(r => r)
            return
        }
        const descendants = nodeToRemove.descendants();
        const descendantIds = new Set(descendants.map(d => d.data.id));
        // 定义被删除节点的父节点位置

        // 选中所有要移除的节点和连接线
        const nodesToRemove = gRef.selectAll<SVGCircleElement, D3Node>('.node')
            .filter(function (d: D3Node) {
                return descendantIds.has(d.data.id);
            });
        const linksToRemove = gRef.selectAll<SVGCircleElement, D3Link>('.link')
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
                const interpolateTargetY = d3.interpolate(d.target.data.nodeType === 'End' ? d.target.y - 200 : d.target.y, o.y);

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

        setTimeout(() => {
            refresh(treeChartState);
        }, 500);
    }

    function handleAddNode(clickedNode: D3Node, nodeType: string) {

        const newNodeData: NodeData =
            {

                id: GenerateUUID(),
                name: nodeType === "End" ? "结束节点" : "New Node" + Math.floor(Math.random() * 90) + 100,
                nodeType: nodeType,
                nodeDesc: "",
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

        const nodesEnter = gRef.select<SVGGElement>(`#node-${newNodeData.id}`);
        nodesEnter.transition()
            .duration(750)
            .style('opacity', 1)
            .attrTween("transform", function (d): (t: number) => string {

                const parentX = d.parent.previousX;
                const parentY = d.parent.previousY;

                const interpolateSourceX = d3.interpolate(parentX, d.x);

                let interpolateSourceY = d3.interpolate(parentY, d.y);
                if (nodeType === "End") {
                    interpolateSourceY = d3.interpolate(parentY, d.y - 200);
                }

                return function (t: number): string {
                    return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                };
            })

    }


    const nodeActions: NodeAction[] = [
        {
            icon: <SmileFilled className={NodeMenuStyles.icon}/>,
            label: '添加代码节点',
            nodeType: "Script",
            action: () => handleAddNode(treeStore.menuNode!, "Script")
        },
        {
            icon: <SmileFilled className={NodeMenuStyles.icon}/>,
            label: '条件节点todo',
            nodeType: "Condition",
            action: () => handleAddNode(treeStore.menuNode!, "Condition")
        },
        {
            icon: <SmileFilled className={NodeMenuStyles.icon}/>,
            label: '规则节点todo',
            nodeType: "Rule",
            action: () => handleAddNode(treeStore.menuNode!, "Rule")
        },
        {
            icon: <SmileFilled className={NodeMenuStyles.icon}/>,
            label: '删除此节点',
            nodeType: "Delete",
            action: () => handleDeleteCurrentTree(treeStore.menuNode!)
        },
        {
            icon: <SmileFilled className={NodeMenuStyles.icon}/>,
            label: '删除当前树',
            action: () => handleDeleteCurrentTree(treeStore.menuNode!)
        },
        {icon: <SmileFilled className={NodeMenuStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
        {
            icon: <SmileFilled className={NodeMenuStyles.icon}/>,
            label: '结束节点',
            nodeType: "End",
            action: () => handleAddNode(treeStore.menuNode!, 'End')
        },
        {icon: <SmileFilled className={NodeMenuStyles.icon}/>, label: 'json批量创建节点', action: () => handDragNode()}
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
                d3.select(`#${generateLinkId(d.parent!.data.id, d.data.id)}`)
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
                    d3.select(`#${generateLinkId(linkData.source.data.id, linkData.target.data.id)}`)
                        .attr("d", d3.linkHorizontal<D3Link, D3Node>().x(node => node.y).y(node => node.x)(linkData));

                })


                let closestNode = null;
                let minDistance = Infinity;
                rootNode.descendants().forEach(node => {
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

                    refresh(treeChartState)

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

        return !!(children && children.length > 0 && children[0].nodeType === "End");


    }

    return (
        <div style={{position: 'absolute', left: menuPosition.x - 255, top: menuPosition.y}}>
            <Popover content={(
                <div>
                    {treeStore.menuNode?.data.nodeType === "End" ? (

                                <div key={Math.random()} className={NodeMenuStyles.deleteNode}
                                     onClick={nodeActions.find(nodeAction => nodeAction.nodeType === "Delete")!.action}>
                                    {nodeActions.find(nodeAction => nodeAction.nodeType === "Delete")!.icon}
                                    <span>{nodeActions.find(nodeAction => nodeAction.nodeType === "Delete")!.label}</span>
                                </div>

                        ) :
                        (
                            <div className={NodeMenuStyles.nodePopup}>
                                {/* 循环应该是每个节点动作的内部 <div> */}
                                {nodeActions.map((nodeAction, index) => {
                                    // 获取当前节点的下一个节点是否是 "End"
                                    const nodeEnd = isNextNodeEnd(treeStore.menuNode); // 假设有一个函数来获取下一个节点

                                    // 判断是否应该禁用图标
                                    const shouldDisableIcon = nodeEnd && (nodeAction.nodeType === "Script" || nodeAction.nodeType === "Condition"
                                        || nodeAction.nodeType === "Rule" || nodeAction.nodeType === "End");

                                    // 渲染节点图标，并根据条件添加禁用样式类
                                    return (
                                        <div key={index} className={NodeMenuStyles.node}>
                                        <span className={`${NodeMenuStyles.icon} `}
                                              onClick={nodeAction.action}>
                                            {nodeAction.icon}
                                        </span>
                                            <span className={NodeMenuStyles.span}>{nodeAction.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    }
                </div>
            )} open={treeStore.draggingNode == null}>
            </Popover>
        </div>
    );


});

export default NodeMenu;
