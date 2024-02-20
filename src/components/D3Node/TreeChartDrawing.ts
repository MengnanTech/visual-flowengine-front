import {D3Link, D3Node, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import * as d3 from "d3";
import scriptNode from '@/assets/logo/ScriptNode.svg';
import ruleNode from '@/assets/logo/RuleNode.svg';
import conditionNode from '@/assets/logo/ConditionNode.svg';
import startNode from '@/assets/logo/StartNode.svg';
import {config, END_NODE_LENGTH} from "@/components/d3Helpers/treeHelpers.ts";
import {TreeStore} from "@/store/TreeStore.ts";


export function endNodeEvent(selection: d3.Selection<SVGRectElement, D3Node, null, undefined>, svgRef: SVGSVGElement, treeStore: TreeStore) {
    selection.on('mouseover', function (_event, d) {
        const transform = d3.zoomTransform(svgRef);

        // 计算变换后的位置
        const transformedX = transform.applyX(d.y);
        const scaledEndNodeLength = END_NODE_LENGTH * transform.k;
        // transform.k 是当前的缩放比例

        const transformedY = transform.applyY(d.x);

        const boundingClientRect = svgRef.getBoundingClientRect();

        // 计算 Popover 在文档中的位置
        const x = boundingClientRect.left + window.scrollX + transformedX - scaledEndNodeLength; // 调整 X 坐标
        const y = boundingClientRect.top + window.scrollY + transformedY;
        treeStore.setCurrentMenu(null)
        setTimeout(() => {
            treeStore.setCurrentMenu({x: x, y: y});
            treeStore.setMenuNode(d);
        }, 10);
    })
}

export function circleEvent(circle: d3.Selection<SVGCircleElement, D3Node, null, undefined>, svgRef: SVGSVGElement, treeStore: TreeStore) {
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
            .style("fill", node.data.scriptType=="Rule"? config.ruleCircle:config.circle)

        treeStore.setCurrentMenu(null)

        setTimeout(() => {
            treeStore.setCurrentMenu({x: x, y: y});
            treeStore.setMenuNode(node);
        }, 1);
    })
        .on('mouseout', function (node) {
            d3.select(this) // 选择当前的圆
                .transition() // 开始一个过渡效果
                .duration(50) // 持续时间
                .attr("r", 20) // 恢复圆的半径
                .style("fill", node.data.scriptType=="Rule"? config.ruleCircle:config.circle)
        })

        .on('contextmenu', function (event,) {
            event.preventDefault(); // 阻止默认的右键菜单

        });
}

export function DrawCircle(treeChartState: TreeChartState, needEvent: boolean = true) {

    const rootNode = treeChartState.rootNode;
    const svgRef = treeChartState.svgRef;
    const gRef = treeChartState.gRef;
    const treeStore = treeChartState.treeStore;

    const nodeSelection = gRef.selectAll<SVGGElement, D3Node>(".node");
    const nodes = nodeSelection.data(rootNode.descendants(), d => d.data.scriptId);

    /**
     * 在D3.js中，.enter()方法是处理数据绑定的一部分，特别是当你想要基于数据集合创建新的DOM元素时。当你将一组数据绑定到DOM元素（比如SVG元素）上，并且数据项的数量超过了现有元素的数量，
     * .enter()就会用于处理这些“多出来”的数据项。
     * 简而言之，.enter()方法会为每个新的数据项返回一个占位符节点，这些节点可以被用来插入新的DOM元素到页面上。
     */
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
        //这里只会出现变化的node 。如果没有变化的刷新。这里不会执行
        const nodeGroup: d3.Selection<SVGGElement, D3Node, null, undefined> = d3.select(this);

        // 检查节点类型，绘制相应的形状
        if (d.data.scriptType === 'End') {

            // 如果节点是 'end' 类型，则绘制正方形
            const selection = nodeGroup.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", -10)
                .attr("y", -10)
                .attr("rx", 5)
                .style("fill", "black")
                .style("stroke", "#999")
                .style("stroke-width", 1.2)
                .style("opacity", 1)
                .raise();
            if (needEvent) {
                endNodeEvent(selection, svgRef, treeStore);
            }


        } else {
            // 否则，绘制圆形
            const circle: d3.Selection<SVGCircleElement, D3Node, null, undefined> = nodeGroup.append<SVGCircleElement>("circle")
                .attr("r", 20)
                .style("fill", d.data.scriptType=="Rule"? config.ruleCircle:config.circle)
                .style("stroke", "#999")
                .style("stroke-width", 1.5)
                .style("opacity", 1)
                .raise();
            if (needEvent) {
                circleEvent(circle, svgRef, treeStore);
            }
            circle.on('click', function (_event, d) {
                treeStore.setClickNode(d)
            })

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
                        .style("fill", "#171616") // 恢复默认文本颜色
                        .style("font-weight", "normal"); // 文字恢复正常
                });


            if (d.data.scriptType == 'Script') {
                // 仅对非 'End' 类型的节点添加图标
                nodeGroup.append('image')
                    .attr('xlink:href', scriptNode) // 替换为你的图标路径
                    .attr('width', 16)  // 图标宽度
                    .attr('height', 16) // 图标高度
                    .attr('x', -8)  // 图标相对于节点中心的 x 偏移
                    .attr('y', -8) // 图标相对于节点中心的 y 偏移
                    .style("pointer-events", "none");
            }
            if (d.data.scriptType == 'Rule') {
                // 仅对非 'End' 类型的节点添加图标
                nodeGroup.append('image')
                    .attr('xlink:href', ruleNode) // 替换为你的图标路径
                    .attr('width', 20)  // 图标宽度
                    .attr('height', 20) // 图标高度
                    .attr('x', -10)  // 图标相对于节点中心的 x 偏移
                    .attr('y', -10) // 图标相对于节点中心的 y 偏移
                    .style("pointer-events", "none");
            }

            if (d.data.scriptType == 'Condition') {
                // 仅对非 'End' 类型的节点添加图标
                nodeGroup.append('image')
                    .attr('xlink:href', conditionNode) // 替换为你的图标路径
                    .attr('width', 20)  // 图标宽度
                    .attr('height', 20) // 图标高度
                    .attr('x', -10)  // 图标相对于节点中心的 x 偏移
                    .attr('y', -10) // 图标相对于节点中心的 y 偏移
                    .style("pointer-events", "none");
            }
            if (d.data.scriptType == 'Start') {
                // 仅对非 'End' 类型的节点添加图标
                nodeGroup.append('image')
                    .attr('xlink:href', startNode) // 替换为你的图标路径
                    .attr('width', 20)  // 图标宽度
                    .attr('height', 20) // 图标高度
                    .attr('x', -10)  // 图标 相对于节点中心的 x 偏移
                    .attr('y', -10) // 图标相对于节点中心的 y 偏移
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


function updateLinkPath(ele: SVGPathElement, _d3Link: D3Link, rootNode: D3Node) {
    // const node = rootNode.descendants().find(n => n.data.scriptId === d3Link.source.data.scriptId);

    // const no_animation_required = node && node.data.scriptType !== "Start"
    //     && (node.previousX === node.x && node.previousY === node.y)
    //     && (d3Link.target.children && d3Link.target.children.length == 1 && d3Link.target.children[0].data.scriptType !== 'End');
    //
    // if (false) {
    //
    //     let targetY = d3Link.target.y;
    //     if (d3Link.target.data.scriptType === 'End') {
    //         targetY -= END_NODE_LENGTH;
    //     }
    //     const path = d3.linkHorizontal<D3Link, D3Node>().x(d => d.y).y(d => d.x)({
    //         source: d3Link.source,
    //         target: {...d3Link.target, y: targetY} as D3Node,
    //     });
    //     d3.select(ele).attr("d", path);
    // } else {
    // 应用动画
    d3.select<SVGPathElement, D3Link>(ele)
        .transition()
        .duration(750)
        .attrTween("d", function (d): (t: number) => string {


            let nodePreviousPosition: number[] | null = null;
            const node = rootNode.descendants().find(node => node.data.scriptId === d.source.data.scriptId);

            // if (node?.previousX && node?.previousY) 这里巨坑。如果是0的话。也会被判断为false 其实想想也对。弱类型的判断0都是false
            if (node?.previousX !== undefined && node?.previousX !== null && node?.previousY !== undefined && node?.previousY !== null) {
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
    // }
}

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
