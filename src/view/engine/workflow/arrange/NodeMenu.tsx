// // NodeMenu.tsx
// import React from 'react';
// import { SmileFilled } from "@ant-design/icons";
// import {message, Popover} from "antd";
// import TreeChartStyles from './TreeChart.module.scss';
// import {TreeStore} from "@/store/TreeStore.ts";
// import * as d3 from "d3";
// import {D3Link, D3Node} from "@/components/D3Node/D3model.ts";
//
// interface NodeAction {
//     icon: React.JSX.Element;
//     label: string;
//     action: () => void;
// }
//
// interface NodeMenuProps {
//     treeStore: TreeStore;
// }
//
//
//
// const NodeMenu: React.FC<NodeMenuProps> = ({treeStore}) => {
//     const menuPosition = treeStore.menuPosition;
//     if (!menuPosition) return null; // 不渲染菜单，如果没有位置信息
//
//     const nodeActions:NodeAction[] = [
//         {
//             icon: <SmileFilled className={TreeChartStyles.icon}/>,
//             label: '添加节点',
//             action: () => handleAddNode(treeStore.menuNode!)
//         },
//         {
//             icon: <SmileFilled className={TreeChartStyles.icon}/>,
//             label: '删除当前树',
//             action: () => handleDeleteCurrentTree(treeStore.menuNode!)
//         },
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         {icon: <SmileFilled className={TreeChartStyles.icon}/>, label: '拖拽节点', action: () => handDragNode()},
//         // 为不同的操作添加不同的图标
//     ];
//
//
//
//
//     function handDragNode() {
//
//
//         const dragStart = {x: 0, y: 0};
//
//         const dragBehavior = d3.drag<any, D3Node>()
//             .on("start", function (event, d) {
//
//
//                 treeStore.setDraggingNode(d)
//
//
//                 if (d === rootNode.current) {
//                     message.error("根节点不可拖拽").then(r => r)
//                     return
//                 }
//                 // 记录拖拽开始时鼠标的位置
//                 dragStart.x = event.x;
//                 dragStart.y = event.y;
//
//                 const descendants = d.descendants();
//                 descendants.forEach(descendant => {
//                     descendant.relativeX = descendant.x - d.x;
//                     descendant.relativeY = descendant.y - d.y;
//                 });
//
//
//             })
//             .on("drag", function (event, d) {
//
//                 if (d === rootNode.current) {
//                     message.error("根节点不可拖拽").then(r => r)
//                     return
//                 }
//                 // 计算鼠标的相对移动距离
//                 const dx = event.x - dragStart.x;
//                 const dy = event.y - dragStart.y;
//                 d3.select(`#link-${d.data.id}`)
//                     .transition()
//                     .duration(30)
//                     .style("opacity", 0)
//                     .on("end", function () {
//                         d3.select(this).remove();
//                     });
//
//                 d.x = dragStart.x + dy;  // 垂直方向移动
//                 d.y = dragStart.y + dx;  // 水平方向移动
//
//                 d.descendants().forEach(descendant => {
//                     descendant.x = d.x + descendant.relativeX;
//                     descendant.y = d.y + descendant.relativeY;
//                     d3.select(`#node-${descendant.data.id}`)
//                         .attr("transform", `translate(${descendant.y},${descendant.x})`);
//                 });
//
//                 // 移动节点
//                 d3.select(this).attr("transform", `translate(${d.y},${d.x})`);
//
//                 d.descendants().forEach(descendant => {
//                     const linkData = {source: descendant.parent, target: descendant} as D3Link;
//                     d3.select(`#link-${descendant.data.id}`)
//                         .attr("d", d3.linkHorizontal<D3Link, D3Node>().x(node => node.y).y(node => node.x)(linkData));
//
//                 })
//
//
//                 let closestNode = null;
//                 let minDistance = Infinity;
//                 rootNode.current.descendants().forEach(node => {
//                     if (node !== d) {
//                         //计算和其他节点的距离
//                         const distance = Math.sqrt((d.x - node.x) ** 2 + (d.y - node.y) ** 2);
//                         if (distance < minDistance) {
//                             minDistance = distance;
//                             closestNode = node;
//                         }
//                     }
//                 });
//
//                 if (closestNode && minDistance < 120) {
//                     closestNodeRef.current = closestNode;
//                     gRef.current!.select(".preview-line")
//                         .style("opacity", 1)
//                         // 画线
//                         .attr("d", d3.line()([[d.y, d.x], [(closestNode as D3Node).y, (closestNode as D3Node).x]]));
//                 } else {
//                     closestNodeRef.current = null;
//                     gRef.current!.select(".preview-line")
//                         .style("opacity", 0);
//                 }
//
//
//             })
//             .on("end", function (_event, d) {
//
//                 // 确保不是根节点
//                 if (d === rootNode.current) {
//                     message.error("根节点不可拖拽").then(r => r);
//                     return;
//                 }
//
//                 const closestNode = closestNodeRef.current;
//                 if (closestNode) {
//
//                     const oldParentNode = d.parent!;
//
//                     const parentChildren = oldParentNode.children;
//                     if (parentChildren) {
//                         oldParentNode.children = parentChildren.filter(child => child !== d);
//                         if (oldParentNode.children.length === 0) {
//                             //没有子节点了，删除children属性，给空数值会报错。d3会认为有children
//                             delete oldParentNode.children;
//                         }
//                     }
//                     if (oldParentNode.data.children) {
//
//                         for (let i = 0; i < oldParentNode.data.children?.length; i++) {
//                             if (oldParentNode.data.children[i].id === d.data.id) {
//                                 oldParentNode.data.children.splice(i, 1)
//                             }
//                         }
//                     }
//
//                     // 更新节点数据：设置新的父节点
//                     d.parent = closestNode;
//
//                     // 添加到新父节点的子节点中
//                     if (!closestNode.children) {
//                         closestNode.children = [];
//                     }
//                     // 递归更新节点深度
//                     updateNodeDepth(d, closestNode.depth + 1);
//
//                     closestNode.children.push(d);
//
//                     if (!closestNode.data.children) {
//                         closestNode.data.children = [];
//                     }
//                     closestNode.data.children.push(d.data);
//
//                     update();
//
//                     // 清除预览线和其他状态
//                     gRef.current!.select(".preview-line").style("opacity", 0);
//                     closestNodeRef.current = null;
//
//                     setTimeout(() => {
//                         treeStore.setDraggingNode(null)
//                     }, 1000);
//
//                 }
//             });
//         gRef.current!.selectAll<SVGGElement, D3Node>(".node").call(dragBehavior);
//
//
//     }
//
//
//
//
//
//     return (
//         <div style={{ position: 'absolute', left: menuPosition.x, top: menuPosition.y }}>
//             <Popover content={(
//                 <div className={TreeChartStyles.nodePopup}>
//                     {nodeActions.map((nodeAction, index) => (
//                         <div key={index} className={TreeChartStyles.node} onClick={nodeAction.action}>
//                             {nodeAction.icon}
//                             <span className={TreeChartStyles.span}>{nodeAction.label}</span>
//                         </div>
//                     ))}
//                 </div>
//             )} open={treeStore.draggingNode==null}>
//             </Popover>
//         </div>
//     );
// };
//
// export default NodeMenu;
