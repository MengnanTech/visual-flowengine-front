import React from 'react';
import * as d3 from 'd3';
import {centerTree, config} from '@/components/d3Helpers/treeHelpers.ts';
import {D3Node} from '@/components/D3Node/NodeModel.ts';
import {TreeStore} from '@/store/TreeStore.ts';
import {circleEvent, endNodeEvent} from '@/components/D3Node/TreeChartDrawing.ts';
import styles from '@/view/engine/styles/TreeChart.module.scss';
import {WorkflowMetadata} from '@/components/model/WorkflowModel.ts';
import {getWorkflowMetadata} from '@/network/api.ts';
import {toast} from '@/components/ui/toast';

interface TreeToolbarProps {
    isReady: boolean;
    treeStore: TreeStore;
    svgRef: React.RefObject<SVGSVGElement>;
    svgSelect: React.MutableRefObject<d3.Selection<any, any, any, any> | null>;
    gRef: React.MutableRefObject<d3.Selection<any, any, any, any> | null>;
    rootNode: React.MutableRefObject<D3Node | undefined>;
    lockedIconRef: React.RefObject<SVGSVGElement>;
    refreshIconRef: React.RefObject<SVGSVGElement>;
    initialData: WorkflowMetadata;
    updateTreeData: (newData: WorkflowMetadata) => void;
    setReadonly: (value: boolean) => void;
}

const TreeToolbar: React.FC<TreeToolbarProps> = ({
    isReady,
    treeStore,
    svgRef,
    svgSelect,
    gRef,
    rootNode,
    lockedIconRef,
    refreshIconRef,
    initialData,
    updateTreeData,
    setReadonly,
}) => {
    const handleLockedIconClick = () => {
        const lockedTongueElement = d3.select('#lockTongue');
        const width = 18;
        const currentTransform = lockedTongueElement.attr('transform');
        const isUnlocked = currentTransform && currentTransform.includes('scale(-1,1)');

        if (isUnlocked) {
            setReadonly(true);
            svgRef.current!.style.backgroundColor = config.pageContainerLockBackgroundColor;
            lockedTongueElement
                .transition()
                .duration(500)
                .attr('transform', 'translate(0,0) scale(1, 1)')
                .on('end', () => {
                    svgSelect.current!.call(d3.zoom().on('zoom', null));

                    const circles = gRef.current!.selectAll('circle');
                    const endNodes = gRef.current!.selectAll<SVGRectElement, D3Node>('rect');

                    endNodes.on('mouseover', null).on('mouseout', null);
                    circles.on('mouseover', null).on('mouseout', null);
                });
        } else {
            setReadonly(false);
            svgRef.current!.style.backgroundColor = config.pageContainerUnLockBackgroundColor;
            lockedTongueElement
                .transition()
                .duration(500)
                .attr('transform', `translate(${width},0) scale(-1, 1) translate(-${width},0)`)
                .on('end', () => {
                    const treeGroup = svgSelect.current!.select<SVGGElement>('g');
                    const svgWidth = +svgSelect.current!.attr('width');
                    const svgHeight = +svgSelect.current!.attr('height');
                    const [x, y] = centerTree(rootNode.current!, svgWidth, svgHeight);
                    const zoomBehavior = d3
                        .zoom()
                        .scaleExtent([0.4, 5])
                        .on('zoom', (event) => {
                            treeStore.setCurrentMenu(null);
                            treeStore.setCurrentTransform(event.transform);
                            treeGroup.attr('transform', event.transform);
                        });

                    svgSelect.current!.call(zoomBehavior);
                    svgSelect.current!.call(
                        zoomBehavior.transform,
                        treeStore.currentTransform == null
                            ? d3.zoomIdentity.translate(x, y).scale(1)
                            : treeStore.currentTransform,
                    );

                    const circles = gRef.current!.selectAll<SVGCircleElement, D3Node>('circle');
                    const endNodes = gRef.current!.selectAll<SVGRectElement, D3Node>('rect');
                    circleEvent(circles, svgRef.current!, treeStore);
                    endNodeEvent(endNodes, svgRef.current!, treeStore);
                });
        }
    };

    const handleRefreshIconClick = () => {
        const selection = d3.select(refreshIconRef.current);

        selection
            .transition()
            .duration(500)
            .attrTween('transform', function () {
                const currentTransform = d3.select(this).attr('transform') || '';

                return function (t) {
                    const rotateTransform = `rotate(${360 * t})`;
                    return `${currentTransform} ${rotateTransform}`;
                };
            })
            .on('end', function () {
                getWorkflowMetadata(initialData.workflowId)
                    .then((result) => {
                        updateTreeData(result);
                    })
                    .finally(() => {
                        toast.success('刷新成功');
                    });
            });
    };

    return (
        <>
            <svg
                style={{position: 'absolute', left: '10px', borderRadius: '50%', padding: '8px 10px'}}
                className={styles.iconWrapper}
                transform={isReady ? `translate(${parseFloat(svgSelect.current!.attr('width')) - 180}, 10)` : undefined}
                ref={lockedIconRef}
                visibility={isReady ? 'visible' : 'hidden'}
                onClick={handleLockedIconClick}
                width="40px"
                height="40px"
                xmlns="http://www.w3.org/2000/svg"
                cursor="pointer"
                viewBox="0 -2 25 25"
                id="myLock"
            >
                <rect x="1" y="8" width="22" height="16" fill="black"/>
                <path
                    d="M 6,8 L 6,1 C 6,-2 9,-4 12,-4 C 15,-4 18,-2 18,1 L 18,8"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    id="lockTongue"
                />
            </svg>

            <svg
                fill="#000000"
                style={{position: 'absolute', left: '50px', borderRadius: '50%', padding: '8px 2px'}}
                className={styles.iconWrapper}
                ref={refreshIconRef}
                visibility={isReady ? 'visible' : 'hidden'}
                onClick={handleRefreshIconClick}
                width="40px"
                height="40px"
                cursor="pointer"
                transform={isReady ? `translate(${parseFloat(svgSelect.current!.attr('width')) - 280}, 10)` : undefined}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 489.645 489.645"
            >
                <g>
                    <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3 c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5 c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8 c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2 C414.856,432.511,548.256,314.811,460.656,132.911z"/>
                </g>
            </svg>
        </>
    );
};

export default TreeToolbar;
