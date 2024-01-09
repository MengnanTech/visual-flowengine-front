import {D3Link, D3Node, TreeChartState} from "@/components/D3Node/NodeModel.ts";
import * as d3 from "d3";


export function DrawCircle(treeChartState: TreeChartState) {

    const rootNode = treeChartState.rootNode;
    const svgRef = treeChartState.svgRef;
    const gRef = treeChartState.gRef;
    const treeStore = treeChartState.treeStore;

    const nodeSelection = gRef.selectAll<SVGGElement, D3Node>(".node");
    const nodes = nodeSelection.data(rootNode.descendants(), d => d.data.id);
    const nodesEnter: d3.Selection<SVGGElement, D3Node, any, any> = nodes.enter()
        .append("g")
        .attr("class", "node")

        .attr("transform", d => {
            //新节点移动到新位置
            return `translate(${d.y},${d.x})`
        })
        .attr('id', d => `node-${d.data.id}`);  // 同时设置ID，用于后续选择
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
    nodesEnter.append('image')
        .attr('xlink:href', 'src/assets/logo/321.svg') // 替换为你的图标路径
        .attr('width', 16)  // 图标宽度
        .attr('height', 16) // 图标高度
        .attr('x', -8)  // 图标相对于节点中心的 x 偏移
        .attr('y', -8) // 图标相对于节点中心的 y 偏移
        .style("pointer-events", "none");

    nodes.transition()
        .duration(750)
        .attr("transform", d => {
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


    console.log("data", JSON.stringify(rootNode.data))
    treeLayout(rootNode);
    gRef.attr("transform", treeStore.currentTransform?.toString()!);

    DrawLinks(treeChartState);
    DrawCircle(treeChartState);
    treeStore.setCurrentMenu(null)
}

export function DrawLinks(treeChartState: TreeChartState) {
    const rootNode = treeChartState.rootNode;

    const gRef = treeChartState.gRef;

    const selection = gRef.selectAll<SVGPathElement, D3Link>(".link");
    const links = selection.data(rootNode.links() as D3Link[], d => {
        return d.target.data.id
    });


    links.enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "url(#movingArrowPattern)")//自定义连接线的样式。
        .attr("stroke-width", 10)
        .attr('id', d => `link-${d.target.data.id}`) // 同时设置ID，用于后续选择
        // .attr('marker-end', 'url(#arrow)')
        .lower()
        .transition()
        .duration(750)
        // 新的连接线的动画效果，感觉可以在这里解决连接线断掉的问题
        .attrTween("d", function (d): (t: number) => string {
            // 插值生成器
            let nodePreviousPosition: number[] | null = null;
            const node = rootNode.descendants().find(node => node.data.id === d.source.data.id);
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
