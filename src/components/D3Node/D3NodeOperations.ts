// import {D3Node, NodeData} from "@/components/D3Node/D3model.ts";
// import {v4 as uuid} from "uuid";
// import * as d3 from "d3";
// import {refresh} from "@/components/D3Node/TreeChartDrawing.ts";
//
// export function addNode(clickedNode: D3Node) {
//
//     const newNodeData: NodeData =
//         {
//
//             id: uuid(),
//             name: "New Node" + Math.floor(Math.random() * 90) + 100,
//             nodeType: "还没想好设计",
//             scriptText: "脚本内容" + uuid(),
//         };
//
//     if (!clickedNode.data.children) {
//         clickedNode.data.children = [];
//     }
//     clickedNode.data.children.push(newNodeData);
//
//     if (!clickedNode.children) {
//         clickedNode.children = [];
//     }
//
//     const newNode = d3.hierarchy(newNodeData) as D3Node;
//     newNode.depth = clickedNode.depth + 1;
//     newNode.parent = clickedNode;
//     clickedNode.children.push(newNode);
//     // refresh(clickedNode);
//     const nodesEnter = gRef.current!.select<SVGGElement>(`#node-${newNodeData.id}`);
//     nodesEnter.transition()
//         .duration(750)
//         .style('opacity', 1)
//         .attrTween("transform", function (d): (t: number) => string {
//
//             const parentX = d.parent.previousX;
//             const parentY = d.parent.previousY;
//
//             const interpolateSourceX = d3.interpolate(parentX, d.x);
//             const interpolateSourceY = d3.interpolate(parentY, d.y);
//
//             return function (t: number): string {
//                 return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
//             };
//         })
// }
