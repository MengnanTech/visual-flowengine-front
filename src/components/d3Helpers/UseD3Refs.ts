import { useRef } from 'react';
import * as d3 from 'd3';
import { D3Node, NodeData } from "@/components/D3Node/D3model.ts";

const useD3Refs = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const svgSelect = useRef<d3.Selection<SVGSVGElement, any, any, any> | null>(null);
    const gRef = useRef<d3.Selection<SVGGElement, any, any, any> | null>(null);
    const rootNode = useRef<D3Node| null>(null);
    const treeLayout = useRef<d3.TreeLayout<NodeData>| null>(null);
    const currentTransform = useRef<d3.ZoomTransform | null>(null);
    const closestNodeRef = useRef<D3Node | null>(null);

    return {
        svgRef,
        svgSelect,
        gRef,
        rootNode,
        treeLayout,
        currentTransform,
        closestNodeRef
    };
};

export default useD3Refs;
