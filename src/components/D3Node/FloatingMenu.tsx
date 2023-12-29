// import React from 'react';
// import { Popover } from "antd";
// import TreeChartStyles from './TreeChart.module.scss';
// import { SmileFilled } from "@ant-design/icons";
//
// interface FloatingMenuProps {
//     menuPosition: { x: number; y: number };
//     menuVisible: boolean;
//     dragging: boolean;
//     onActionSelect: (action: () => void) => void;
// }
//
//
//
// const FloatingMenu: React.FC<FloatingMenuProps> = ({ menuPosition, menuVisible, dragging, onActionSelect }) => {
//     const nodeActions = [
//         {
//             icon: <SmileFilled className={TreeChartStyles.icon}/>,
//             label: '添加节点',
//             action: () => handleAddNode(menuNode!)
//         },
//         {
//             icon: <SmileFilled className={TreeChartStyles.icon}/>,
//             label: '删除节点',
//             action: () => handleDeleteNode(menuNode!)
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
//     const menuContent = (
//         <div className={TreeChartStyles.nodePopup}>
//             {nodeActions.map((nodeAction, index) => (
//                 <div key={index} className={TreeChartStyles.node} onClick={() => onActionSelect(nodeAction.action)}>
//                     {nodeAction.icon}
//                     <span className={TreeChartStyles.span}>
//                         {nodeAction.label}
//                     </span>
//                 </div>
//             ))}
//         </div>
//     );
//
//     return (
//         <div
//             style={{
//                 position: 'absolute',
//                 left: menuPosition.x,
//                 top: menuPosition.y,
//             }}
//         >
//             <Popover content={menuContent} open={menuVisible && !dragging}>
//             </Popover>
//         </div>
//     );
// };
//
// export default FloatingMenu;
