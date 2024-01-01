import * as d3 from "d3";
import {TreeStore} from "@/store/TreeStore.ts";

export interface NodeData {
    id: string;
    name: string;
    scriptText: string;
    nodeType: string;
    children?: NodeData[];
}

export interface D3Node extends d3.HierarchyNode<NodeData> {
    relativeX: number;
    relativeY: number;
    x: number;
    y: number;
    depth: number;
    height: number;

    previousX?: number;
    previousY?: number;
}

export interface D3Link extends d3.HierarchyLink<NodeData> {
    source: D3Node;
    target: D3Node;
    parent?: {
        x: number;
        y: number;
    }
    x?: number;
    y?: number;
}

export interface TreeChartState {
    gRef: d3.Selection<any, any, any, any>;
    rootNode: D3Node;
    svgRef: SVGSVGElement;
    treeLayout: d3.TreeLayout<NodeData>;
    currentTransform: d3.ZoomTransform;
    closestNodeRef:D3Node;
    treeStore: TreeStore;
}
