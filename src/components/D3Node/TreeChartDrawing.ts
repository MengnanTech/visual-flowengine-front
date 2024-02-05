import {D3Link, D3Node, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import * as d3 from "d3";
import circleIcon from '@/assets/logo/321.svg';
import {END_NODE_LENGTH} from "@/components/d3Helpers/treeHelpers.ts";
import {message} from "antd";


export function DrawCircle(treeChartState: TreeChartState) {

    const rootNode = treeChartState.rootNode;
    const svgRef = treeChartState.svgRef;
    const gRef = treeChartState.gRef;
    const treeStore = treeChartState.treeStore;

    const nodeSelection = gRef.selectAll<SVGGElement, D3Node>(".node");
    const nodes = nodeSelection.data(rootNode.descendants(), d => d.data.scriptId);

    const nodesEnter: d3.Selection<SVGGElement, D3Node, any, any> = nodes.enter()
        .append("g")
        .attr("class", "node")

        .attr("transform", d => {

            if (d.data.scriptType === 'End') {

                return `translate(${d.y - END_NODE_LENGTH},${d.x})`;
            } else {
                return `translate(${d.y},${d.x})`;
            }
        })
        .attr('id', d => `node-${d.data.scriptId}`);  // 同时设置ID，用于后续选择

    nodesEnter.each(function (d) {
        const nodeGroup: d3.Selection<SVGGElement, D3Node, null, undefined> = d3.select(this);

        // 检查节点类型，绘制相应的形状
        if (d.data.scriptType === 'End') {

            // 如果节点是 'end' 类型，则绘制正方形
            const selection = nodeGroup.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", -10)
                .attr("y", -10)
                .style("fill", "red")
                .style("stroke", "#999")
                .style("stroke-width", 1.5)
                .style("opacity", 1)
                .raise();

            selection.on('mouseover', function (_event, d) {
                const transform = d3.zoomTransform(svgRef);

                // 计算变换后的位置
                const transformedX = transform.applyX(d.y);
                const transformedY = transform.applyY(d.x);

                const boundingClientRect = svgRef.getBoundingClientRect();

                // 计算 Popover 在文档中的位置
                const x = boundingClientRect.left + window.scrollX + transformedX; // 调整 X 坐标
                // const x = boundingClientRect.left + window.scrollX + transformedX - popoverWidth / 2; // 调整 X 坐标
                const y = boundingClientRect.top + window.scrollY + transformedY;
                treeStore.setCurrentMenu(null)

                setTimeout(() => {
                    treeStore.setCurrentMenu({x: x - END_NODE_LENGTH, y: y});
                    treeStore.setMenuNode(d);
                }, 1);
            })


        } else {
            // 否则，绘制圆形
            const circle: d3.Selection<SVGCircleElement, D3Node, null, undefined> = nodeGroup.append<SVGCircleElement>("circle")
                .attr("r", 20)
                .style("fill", "#c0f1b0")
                .style("stroke", "#999")
                .style("stroke-width", 1.5)
                .style("opacity", 1)
                .raise();
            circle.on('mouseover', function (_event, node) {
                const circleRadius = 10; // 圆的半径
                const popoverHeight = 10; // Popover 的高度
                // const popoverWidth = 10; // 假设的 Popover 宽度

                // 获取当前的缩放变换
                const transform = d3.zoomTransform(svgRef);

                // 计算变换后的位置
                const transformedX = transform.applyX(node.y);
                const transformedY = transform.applyY(node.x) - circleRadius - popoverHeight;

                const boundingClientRect = svgRef.getBoundingClientRect();

                // 计算 Popover 在文档中的位置
                const x = boundingClientRect.left + window.scrollX + transformedX; // 调整 X 坐标
                // const x = boundingClientRect.left + window.scrollX + transformedX - popoverWidth / 2; // 调整 X 坐标
                const y = boundingClientRect.top + window.scrollY + transformedY;

                d3.select(this)
                    .transition()
                    .duration(5)
                    .attr("r", 25)
                    .style("fill", "#a9db80");
                treeStore.setCurrentMenu(null)

                setTimeout(() => {
                    treeStore.setCurrentMenu({x: x, y: y});
                    treeStore.setMenuNode(node);
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
                    treeStore.setClickNode(d)
                })
                .on('contextmenu', function (event,) {
                    event.preventDefault(); // 阻止默认的右键菜单

                });


            nodeGroup.append("text")
                .attr("dy", "-2em")
                .attr("x", 0)
                .style("text-anchor", "middle")
                // .style("pointer-events", "none") 取消所有事件
                .text(d => d.data.scriptName)
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


            if (d.data.scriptType !== 'End') {
                // 仅对非 'End' 类型的节点添加图标
                nodeGroup.append('image')
                    .attr('xlink:href', circleIcon) // 替换为你的图标路径
                    .attr('width', 16)  // 图标宽度
                    .attr('height', 16) // 图标高度
                    .attr('x', -8)  // 图标相对于节点中心的 x 偏移
                    .attr('y', -8) // 图标相对于节点中心的 y 偏移
                    .style("pointer-events", "none");
            }

        }
    });

    nodes.transition()
        .duration(750)
        .attr("transform", d => {
            if (d.data.scriptType === 'End') {
                return `translate(${d.y - END_NODE_LENGTH},${d.x})`;
            }
            return `translate(${d.y},${d.x})`
        });
}

export function refresh(treeChartState: TreeChartState) {
    const rootNode = treeChartState.rootNode;
    const treeLayout = treeChartState.treeLayout;
    const gRef = treeChartState.gRef;
    const treeStore = treeChartState.treeStore;


    rootNode.descendants().forEach(d => {

        console.log('rootNode.descendants()', d)
        d.previousX = d.x
        d.previousY = d.y
    });

    treeLayout(rootNode);
    gRef.attr("transform", treeStore.currentTransform?.toString()!);

    DrawLinks(treeChartState);
    DrawCircle(treeChartState);
    treeStore.setCurrentMenu(null)
}

export function generateLinkId(sourceId: string, targetId: string): string {

    return `link--${sourceId}--${targetId}`;
}


function updateLinkPath(ele: SVGPathElement, d: D3Link, rootNode: D3Node) {
    const node = rootNode.descendants().find(n => n.data.scriptId === d.source.data.scriptId);

    const no_animation_required = node && node.data.scriptType !== "Start"
        && (node.previousX === node.x && node.previousY === node.y)
        && (d.target.children && d.target.children.length == 1 && d.target.children[0].data.scriptType !== 'End');

    if (no_animation_required || d.needTransition === false) {

        let targetY = d.target.y;
        if (d.target.data.scriptType === 'End') {
            targetY -= END_NODE_LENGTH;
        }
        const path = d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)({
            source: d.source,
            target: {...d.target, y: targetY} as D3Node,
        });
        d3.select(ele).attr("d", path);
    } else {
        // 应用动画
        d3.select<SVGPathElement, D3Link>(ele)
            .transition()
            .duration(750)
            .attrTween("d", function (d): (t: number) => string {

                let nodePreviousPosition: number[] | null = null;
                const node = rootNode.descendants().find(node => node.data.scriptId === d.source.data.scriptId);
                console.log("node", node)
                if (node?.previousX && node?.previousY) {
                    nodePreviousPosition = [node.previousX, node.previousY];
                }

                if (nodePreviousPosition == null) {
                    return function (t: number): string {
                        let interpolateY = d3.interpolate(d.source.y, d.target.y);

                        if (d.target.data.scriptType === 'End') {
                            interpolateY = d3.interpolate(d.source.y, d.target.y - END_NODE_LENGTH);
                        }
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
                    let interpolateY = d3.interpolate(previousY, d.target.y);

                    if (d.target.data.scriptType === 'End') {
                        interpolateY = d3.interpolate(d.source.y, d.target.y - END_NODE_LENGTH);
                    }
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

            })
    }
}

// export function DrawLinks(treeChartState: TreeChartState) {
//     const rootNode = treeChartState.rootNode;
//     const gRef = treeChartState.gRef;
//
//     const selection = gRef.selectAll<SVGPathElement, D3Link>(".link");
//     const links = selection.data(rootNode.links() as D3Link[], d => d.target.data.scriptId);
//
//     links.enter()
//         .append("path")
//         .attr("class", "link")
//         .attr("fill", "none")
//         .attr("stroke", "url(#movingArrowPattern)") // 自定义连接线的样式。
//         .attr("stroke-width", 10)
//         .attr('id', d => generateLinkId(d.source.data.scriptId, d.target.data.scriptId)) // 同时设置ID
//         .lower()
//         .transition()
//         .duration(750)
//         .attrTween("d", function (d): (t: number) => string {
//             // 插值生成器
//             let nodePreviousPosition: number[] | null = null;
//             const node = rootNode.descendants().find(node => node.data.scriptId === d.source.data.scriptId);
//             if (node?.previousX && node?.previousY) {
//                 nodePreviousPosition = [node.previousX, node.previousY];
//             }
//
//
//             if (nodePreviousPosition == null) {
//
//                 return function (t: number): string {
//                     let interpolateY = d3.interpolate(d.source.y, d.target.y);
//
//                     if (d.target.data.scriptType === 'End') {
//                         interpolateY = d3.interpolate(d.source.y, d.target.y - END_NODE_LENGTH);
//                     }
//                     const interpolateX = d3.interpolate(d.source.x, d.target.x);
//
//                     const tempD: D3Link = {
//                         source: {x: d.source.x, y: d.source.y} as D3Node,
//                         target: {x: interpolateX(t), y: interpolateY(t)} as D3Node,
//                     };
//
//                     return d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)(tempD)!;
//                 };
//
//             } else {
//
//                 const previousY = nodePreviousPosition[1];
//                 const previousX = nodePreviousPosition[0];
//                 let interpolateY = d3.interpolate(previousY, d.target.y);
//
//                 if (d.target.data.scriptType === 'End') {
//                     interpolateY = d3.interpolate(d.source.y, d.target.y - END_NODE_LENGTH);
//                 }
//                 const interpolateX = d3.interpolate(previousX, d.target.x);
//
//                 const sourceY = d3.interpolate(previousY, d.source.y);
//                 const sourceX = d3.interpolate(previousX, d.source.x);
//
//
//                 return function (t: number): string {
//                     // t 是从 0 到 1 的过渡状态
//                     // 计算新的目标位置
//                     const newY = interpolateY(t);
//                     const newX = interpolateX(t);
//
//                     // 临时更新 d.target 的位置
//                     const tempD: D3Link = {
//                         source: {x: sourceX(t), y: sourceY(t)} as D3Node,
//                         target: {x: newX, y: newY} as D3Node,
//                     };
//
//                     return d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)(tempD)!;
//                 };
//             }
//
//         });
//
//     //写上这段代码，删掉节点的时候。连接线也删除了
//     links.exit().remove();
//
//     // 旧的连接线的动画效果
//     links.transition()
//         .duration(750)
//         .attr("d",
//             d3.linkHorizontal<D3Link, D3Node>().x(function (d) {
//                 if (d.data.scriptType === 'End') {
//                     return d.y - END_NODE_LENGTH;
//                 }
//                 return d.y;
//
//             }).y(d => d.x)
//         );
//
// }

export function DrawLinks(treeChartState: TreeChartState) {
    const rootNode = treeChartState.rootNode;
    const gRef = treeChartState.gRef;

    const selection = gRef.selectAll<SVGPathElement, D3Link>(".link");
    const links = selection.data(rootNode.links() as D3Link[], d => d.target.data.scriptId);

    links.enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "url(#movingArrowPattern)") // 自定义连接线的样式。
        .attr("stroke-width", 10)
        .attr('id', d => generateLinkId(d.source.data.scriptId, d.target.data.scriptId)) // 同时设置ID
        .lower()
        .transition()
        .duration(750)
        .each(function (d) {
            updateLinkPath(this, d, rootNode);
        })

    //写上这段代码，删掉节点的时候。连接线也删除了
    links.exit().remove();

    // 旧的连接线的动画效果
    links.transition()
        .duration(750)
        .attr("d",
            d3.linkHorizontal<D3Link, D3Node>().x(function (d) {
                if (d.data.scriptType === 'End') {
                    return d.y - END_NODE_LENGTH;
                }
                return d.y;

            }).y(d => d.x)
        );

}
