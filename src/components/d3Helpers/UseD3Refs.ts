import { useRef } from 'react';
import * as d3 from 'd3';
import {D3Node, NodeData} from "@/components/D3Node/D3model.ts";

const useD3Refs = (initialData:NodeData) => {
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

    return { svgRef, svgSelect, gRef, rootNode, treeLayout, currentTransform, closestNodeRef };
};

export default useD3Refs;
