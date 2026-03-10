import {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {centerTree} from '@/components/d3Helpers/treeHelpers.ts';
import {D3Node, NodeData, TreeChartState} from '@/components/D3Node/NodeModel.ts';
import {TreeStore} from '@/store/TreeStore.ts';
import {DrawCircle, DrawLinks} from '@/components/D3Node/TreeChartDrawing.ts';
import {WorkflowMetadata} from '@/components/model/WorkflowModel.ts';

interface UseTreeChartLayoutParams {
    initialData: WorkflowMetadata;
    treeStore: TreeStore;
    svgRef: React.RefObject<SVGSVGElement>;
    onBackgroundClick: () => void;
}

export function useTreeChartLayout({
    initialData,
    treeStore,
    svgRef,
    onBackgroundClick,
}: UseTreeChartLayoutParams) {
    const svgSelect = useRef<d3.Selection<any, any, any, any> | null>(null);
    const gRef = useRef<d3.Selection<any, any, any, any> | null>(null);
    const rootNode = useRef<D3Node>();
    const closestNodeRef = useRef<D3Node | null>();
    const treeChartState = useRef<TreeChartState | null>(null);
    const treeLayout = useRef(d3.tree<NodeData>()
        .nodeSize([100, 250])
        .separation(function () {
            return 1;
        }));
    const [isTreeChartStateReady, setIsTreeChartStateReady] = useState(false);
    const [windowSize, setWindowSize] = useState({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
    });

    useEffect(() => {
        d3.select(svgRef.current).selectAll('*').remove();
        rootNode.current = d3.hierarchy(initialData.scriptMetadata) as D3Node;
        svgSelect.current = d3.select(svgRef.current);
        gRef.current = svgSelect.current.append('g');

        d3.select('body').on('click.tree-chart', () => {
            treeStore.setCurrentMenu(null);
        });

        const root = rootNode.current;

        gRef.current.append('path')
            .attr('class', 'preview-line')
            .style('stroke', 'red')
            .attr('stroke-width', 4)
            .style('stroke-dasharray', '5,5')
            .style('opacity', 0);

        treeLayout.current(root);

        const svgWidth = +svgSelect.current.attr('width');
        const svgHeight = +svgSelect.current.attr('height');
        const [x, y] = centerTree(root, svgWidth, svgHeight);

        gRef.current.attr('transform', `translate(${x},${y})`);
        svgSelect.current.on('dblclick.zoom', null);

        const initState = {
            gRef: gRef.current,
            rootNode: rootNode.current,
            svgRef: svgRef.current!,
            treeLayout: treeLayout.current,
            closestNodeRef: closestNodeRef.current!,
            treeStore,
            currentData: initialData,
        } as TreeChartState;

        treeChartState.current = initState;

        rootNode.current.descendants().forEach((node) => {
            node.previousX = node.x;
            node.previousY = node.y;
        });

        DrawLinks(initState);
        DrawCircle(initState, false);
        setIsTreeChartStateReady(true);

        window.addEventListener('click', onBackgroundClick);

        return () => {
            d3.select('body').on('click.tree-chart', null);
            window.removeEventListener('click', onBackgroundClick);
        };
    }, [initialData, onBackgroundClick, svgRef, treeStore]);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        gRef,
        rootNode,
        svgSelect,
        treeChartState,
        isTreeChartStateReady,
        windowSize,
    };
}
