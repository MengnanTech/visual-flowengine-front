import React from 'react';
import {toast} from '@/components/ui/toast';
import * as d3 from 'd3';
import {Transition} from 'd3';
import {D3Link, D3Node, NodeData, TreeChartState} from '@/components/D3Node/NodeModel.ts';
import {generateLinkId, refresh} from '@/components/D3Node/TreeChartDrawing.ts';
import {observer} from 'mobx-react';
import {END_NODE_LENGTH, GenerateUUID} from '@/components/d3Helpers/treeHelpers.ts';
import scriptIcon from '@/assets/logo/ScriptNode.svg';
import ruleIcon from '@/assets/logo/RuleNode.svg';
import conditionIcon from '@/assets/logo/ConditionNode.svg';
import deleteIcon from '@/assets/logo/Delete.svg';
import deleteTreeIcon from '@/assets/logo/DeleteTree.svg';
import endIcon from '@/assets/logo/end.svg';
import dragIcon from '@/assets/logo/drag.svg';
import replaceIcon from '@/assets/logo/replace.svg';
import NodeMenuPopup from '@/components/D3Node/node-menu/NodeMenuPopup.tsx';
import {buildNodeActions} from '@/components/D3Node/node-menu/buildNodeActions.ts';

interface NodeMenuProps {
    treeChartState: TreeChartState;
}

const NodeMenu: React.FC<NodeMenuProps> = observer(({treeChartState}) => {
    const treeStore = treeChartState.treeStore;
    const menuPosition = treeStore.menuPosition;
    const siderWidth = treeChartState.treeStore.siderWidth;
    const rootNode = treeChartState.rootNode;
    const gRef = treeChartState.gRef;

    if (!menuPosition || treeStore.clickNode) {
        return null;
    }

    function handleDeleteCurrentTree(nodeToRemove: D3Node) {
        if (nodeToRemove.parent == null) {
            toast.error('根节点无法删除');
            return;
        }

        const descendants = nodeToRemove.descendants();
        const descendantIds = new Set(descendants.map((node) => node.data.scriptId));
        const nodesToRemove = gRef.selectAll<SVGCircleElement, D3Node>('.node')
            .filter(function (node: D3Node) {
                return descendantIds.has(node.data.scriptId);
            });
        const linksToRemove = gRef.selectAll<SVGCircleElement, D3Link>('.link')
            .filter((link: D3Link) => descendantIds.has(link.target.data.scriptId));

        nodesToRemove.transition().duration(750)
            .style('opacity', 0)
            .attr('transform', `translate(${nodeToRemove.parent.y},${nodeToRemove.parent.x})`)
            .remove();

        removeLink(linksToRemove.transition().duration(750), nodeToRemove);

        const parentChildren = nodeToRemove.parent.children;
        if (parentChildren) {
            nodeToRemove.parent.children = parentChildren.filter((child) => child !== nodeToRemove);
            if (nodeToRemove.parent.children.length === 0) {
                delete nodeToRemove.parent.children;
            }
        }

        if (nodeToRemove.parent.data.children) {
            for (let index = 0; index < nodeToRemove.parent.data.children.length; index += 1) {
                if (nodeToRemove.parent.data.children[index].scriptId === nodeToRemove.data.scriptId) {
                    nodeToRemove.parent.data.children.splice(index, 1);
                }
            }
        }

        setTimeout(() => {
            refresh(treeChartState);
        }, 500);
    }

    function handleAddNode(clickedNode: D3Node, nodeType: string) {
        const newNodeData: NodeData = {
            scriptId: GenerateUUID(),
            scriptName: nodeType === 'End' ? 'End' : `New Node${Math.floor(Math.random() * 90) + 100}`,
            scriptText: '',
            scriptType: nodeType,
            scriptDesc: '',
            children: null,
        };

        if (!clickedNode.data.children) {
            clickedNode.data.children = [];
        }
        clickedNode.data.children.push(newNodeData);

        if (!clickedNode.children) {
            clickedNode.children = [];
        }

        const newNode = d3.hierarchy(newNodeData) as D3Node;
        newNode.depth = clickedNode.depth + 1;
        newNode.parent = clickedNode;
        clickedNode.children.push(newNode);

        refresh(treeChartState);

        const nodesEnter = gRef.select<SVGGElement>(`#node-${newNodeData.scriptId}`);
        nodesEnter.transition()
            .duration(750)
            .style('opacity', 1)
            .attrTween('transform', function (node): (t: number) => string {
                const parentX = node.parent.previousX;
                const parentY = node.parent.previousY;
                const interpolateSourceX = d3.interpolate(parentX, node.x);
                let interpolateSourceY = d3.interpolate(parentY, node.y);

                if (nodeType === 'End') {
                    interpolateSourceY = d3.interpolate(parentY, node.y - END_NODE_LENGTH);
                }

                return function (t: number): string {
                    return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                };
            });
    }

    function handleConditionNode(clickedNode: D3Node) {
        const newNodeData: NodeData = {
            scriptId: GenerateUUID(),
            scriptName: `New Condition Node${Math.floor(Math.random() * 90) + 10}`,
            scriptText: '',
            scriptType: 'Condition',
            scriptDesc: '',
            children: null,
        };

        const newNode = d3.hierarchy(newNodeData, (node) => node.children) as D3Node;
        newNode.depth = clickedNode.depth + 1;
        newNode.parent = clickedNode;

        if (!clickedNode.children) {
            clickedNode.children = [];
        }

        if (!clickedNode.data.children) {
            clickedNode.data.children = [];
        } else {
            clickedNode.data.children = clickedNode.data.children.filter((childData) => childData.scriptType === 'Condition');
        }

        const nonConditionChildrenData: NodeData[] = [];

        for (let index = clickedNode.children.length - 1; index >= 0; index -= 1) {
            const child = clickedNode.children[index];
            if (child.data.scriptType !== 'Condition') {
                if (!newNode.children) {
                    newNode.children = [];
                }
                newNode.children.push(child);
                clickedNode.children.splice(index, 1);
                child.parent = newNode;

                nonConditionChildrenData.push(child.data);
                updateNodeDepth(child, newNode.depth + 1);

                const oldLinkId = generateLinkId(clickedNode.data.scriptId, child.data.scriptId);
                const newLinkId = generateLinkId(newNode.data.scriptId, child.data.scriptId);
                d3.select(`#${oldLinkId}`).attr('id', newLinkId);
            }
        }

        newNodeData.children = nonConditionChildrenData.length === 0 ? null : nonConditionChildrenData;
        clickedNode.children.push(newNode);
        clickedNode.data.children.push(newNodeData);
        refresh(treeChartState);

        const nodesEnter = gRef.select<SVGGElement>(`#node-${newNodeData.scriptId}`);
        nodesEnter.transition()
            .duration(750)
            .style('opacity', 1)
            .attrTween('transform', function (node): (t: number) => string {
                const parentX = node.parent.previousX;
                const parentY = node.parent.previousY;
                const interpolateSourceX = d3.interpolate(parentX, node.x);
                const interpolateSourceY = d3.interpolate(parentY, node.y);

                return function (t: number): string {
                    return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                };
            });
    }

    function removeLink(transition: Transition<SVGCircleElement, D3Link, any, any>, nodeToRemove: D3Node) {
        transition.style('opacity', 0)
            .attrTween('d', function (link): (t: number) => string {
                const parentPoint = {x: nodeToRemove.parent!.x, y: nodeToRemove.parent!.y};
                const interpolateSourceX = d3.interpolate(link.source.x, parentPoint.x);
                const interpolateSourceY = d3.interpolate(link.source.y, parentPoint.y);
                const interpolateTargetX = d3.interpolate(link.target.x, parentPoint.x);
                const interpolateTargetY = d3.interpolate(
                    link.target.data.scriptType === 'End' ? link.target.y - END_NODE_LENGTH : link.target.y,
                    parentPoint.y,
                );

                return function (t: number): string {
                    const spreadElements: D3Link = {
                        source: {x: interpolateSourceX(t), y: interpolateSourceY(t)} as D3Node,
                        target: {x: interpolateTargetX(t), y: interpolateTargetY(t)} as D3Node,
                    };

                    return d3.linkHorizontal<D3Link, D3Node>().x((node) => node.y).y((node) => node.x)(spreadElements)!;
                };
            })
            .on('end', function () {
                d3.select(this).remove();
            });
    }

    function handleDeleteNode(nodeToRemove: D3Node) {
        if (!nodeToRemove.parent) {
            toast.error('根节点无法删除');
            return;
        }

        const nodesEnter = gRef.select<SVGGElement>(`#node-${nodeToRemove.data.scriptId}`);
        nodesEnter.transition().duration(500)
            .style('opacity', 0)
            .attr('transform', `translate(${nodeToRemove.parent.y},${nodeToRemove.parent.x})`)
            .on('end', function () {
                d3.select(this).remove();
            });

        d3.select(`#${generateLinkId(nodeToRemove.parent.data.scriptId, nodeToRemove.data.scriptId)}`)
            .transition().duration(450).style('opacity', 0).remove();

        if (nodeToRemove.children && nodeToRemove.children.length > 0) {
            nodeToRemove.children.forEach((child) => {
                const oldLinkId = generateLinkId(nodeToRemove.data.scriptId, child.data.scriptId);
                const newLinkId = generateLinkId(nodeToRemove.parent!.data.scriptId, child.data.scriptId);
                d3.select(`#${oldLinkId}`).attr('id', newLinkId);
            });
        }

        const parentChildren = nodeToRemove.parent.children;
        if (parentChildren) {
            const newChildren = [...parentChildren];
            const nodeIndex = newChildren.findIndex((child) => child === nodeToRemove);

            if (nodeIndex !== -1) {
                if (nodeToRemove.children && nodeToRemove.children.length > 0) {
                    newChildren.splice(nodeIndex, 1, ...nodeToRemove.children);
                    nodeToRemove.children.forEach((child) => {
                        child.parent = nodeToRemove.parent;
                        updateNodeDepth(child, child.parent!.depth + 1);
                    });
                } else {
                    newChildren.splice(nodeIndex, 1);
                }
            }

            if (newChildren.length === 0) {
                delete nodeToRemove.parent.children;
            } else {
                nodeToRemove.parent.children = newChildren;
            }
        }

        if (nodeToRemove.data.children && nodeToRemove.data.children.length > 0) {
            const parentDataChildren = nodeToRemove.parent.data.children;
            const nodeIndex = parentDataChildren!.findIndex((child) => child.scriptId === nodeToRemove.data.scriptId);
            if (nodeIndex !== -1) {
                parentDataChildren!.splice(nodeIndex, 1, ...nodeToRemove.data.children);
            }
        } else {
            nodeToRemove.parent.data.children = null;
        }

        setTimeout(() => {
            refresh(treeChartState);
        }, 650);
    }

    function handleReplaceNode(nodeToRemove: D3Node) {
        if (!nodeToRemove.parent) {
            toast.error('根节点无法删除');
            return;
        }

        const nodesEnter = gRef.select<SVGGElement>(`#node-${nodeToRemove.data.scriptId}`);
        nodesEnter.transition().duration(500)
            .style('opacity', 0)
            .attr('transform', `translate(${nodeToRemove.parent.y},${nodeToRemove.parent.x})`)
            .on('end', function () {
                d3.select(this).remove();
            });

        if (nodeToRemove.children && nodeToRemove.children.length >= 1) {
            const firstChild = nodeToRemove.children[0];
            d3.select<SVGPathElement, D3Link>(`#${generateLinkId(nodeToRemove.parent.data.scriptId, nodeToRemove.data.scriptId)}`)
                .attr('id', `${generateLinkId(nodeToRemove.parent.data.scriptId, firstChild.data.scriptId)}`);

            d3.select(`#${generateLinkId(nodeToRemove.data.scriptId, firstChild.data.scriptId)}`)
                .transition().duration(600).style('opacity', 0).remove();

            nodeToRemove.children.forEach((child) => {
                if (child !== firstChild) {
                    d3.select<SVGPathElement, D3Link>(`#${generateLinkId(nodeToRemove.data.scriptId, child.data.scriptId)}`)
                        .attr('id', `${generateLinkId(firstChild.data.scriptId, child.data.scriptId)}`);
                }
            });

            gRef.select<SVGGElement>(`#node-${firstChild.data.scriptId}`)
                .transition()
                .duration(650)
                .attrTween('transform', function (node): (t: number) => string {
                    const interpolateSourceX = d3.interpolate(node.x, nodeToRemove.x);
                    const interpolateSourceY = d3.interpolate(node.y, nodeToRemove.y);
                    return function (t: number): string {
                        return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                    };
                });
        } else {
            d3.select(`#${generateLinkId(nodeToRemove.parent.data.scriptId, nodeToRemove.data.scriptId)}`)
                .transition().duration(450).style('opacity', 0).remove();
        }

        const parentChildren = nodeToRemove.parent.children;
        if (parentChildren) {
            if (nodeToRemove.children && nodeToRemove.children.length > 0) {
                const firstChild = nodeToRemove.children[0];
                updateNodeDepth(firstChild, firstChild.depth - 1);
                nodeToRemove.parent.children = parentChildren.map((child) => child === nodeToRemove ? firstChild : child);

                if (nodeToRemove.children.length > 1) {
                    const remainingChildren = nodeToRemove.children.slice(1);
                    firstChild.children = firstChild.children ? firstChild.children.concat(remainingChildren) : remainingChildren;
                    remainingChildren.forEach((child) => {
                        child.parent = firstChild;
                    });
                }

                firstChild.parent = nodeToRemove.parent;
            } else {
                nodeToRemove.parent.children = parentChildren.filter((child) => child !== nodeToRemove);

                if (nodeToRemove.parent.children.length === 0) {
                    delete nodeToRemove.parent.children;
                }
            }
        }

        if (nodeToRemove.data.children && nodeToRemove.data.children.length > 0) {
            const firstChildData = nodeToRemove.data.children[0];

            if (nodeToRemove.data.children.length > 1) {
                const remainingChildrenData = nodeToRemove.data.children.slice(1);
                firstChildData.children = (firstChildData.children || []).concat(remainingChildrenData);
            }

            const parentDataChildren = nodeToRemove.parent.data.children;
            const nodeIndex = parentDataChildren!.findIndex((child) => child.scriptId === nodeToRemove.data.scriptId);
            if (nodeIndex !== -1) {
                parentDataChildren!.splice(nodeIndex, 1, firstChildData);
            }
        } else {
            const parentDataChildren = nodeToRemove.parent.data.children;
            const nodeIndex = parentDataChildren!.findIndex((child) => child.scriptId === nodeToRemove.data.scriptId);
            if (nodeIndex !== -1) {
                parentDataChildren!.splice(nodeIndex, 1);
            }
        }

        setTimeout(() => {
            refresh(treeChartState);
        }, 750);
    }

    function updateNodeDepth(node: D3Node, newDepth: number) {
        node.depth = newDepth;
        if (node.children) {
            node.children.forEach((child) => updateNodeDepth(child, newDepth + 1));
        }
    }

    function handleScriptNode(clickedNode: D3Node, stringType: string) {
        const uuid = GenerateUUID();
        const newNodeData: NodeData = {
            scriptId: uuid,
            scriptName: `New ${stringType} Node:${uuid.split('-').pop()}`,
            scriptText: '',
            scriptType: stringType,
            scriptDesc: '',
            children: null,
        };

        const newNode = d3.hierarchy(newNodeData, (node) => node.children) as D3Node;
        newNode.depth = clickedNode.depth + 1;
        newNode.parent = clickedNode;

        if (clickedNode.children) {
            newNode.children = clickedNode.children;
            newNode.children.forEach((child) => {
                child.parent = newNode;
                updateNodeDepth(child, newNode.depth + 1);
            });
        }

        clickedNode.children = [newNode];
        clickedNode.data.children = [newNodeData];
        newNodeData.children = newNode.children ? newNode.children.map((child) => child.data) : null;

        newNodeData.children?.forEach((child) => {
            d3.select<SVGPathElement, D3Link>(`#${generateLinkId(clickedNode.data.scriptId, child.scriptId)}`)
                .attr('id', `${generateLinkId(newNode.data.scriptId, child.scriptId)}`);
        });

        refresh(treeChartState);

        const nodesEnter = gRef.select<SVGGElement>(`#node-${newNodeData.scriptId}`);
        nodesEnter.transition()
            .duration(750)
            .style('opacity', 1)
            .attrTween('transform', function (node): (t: number) => string {
                const interpolateSourceX = d3.interpolate(clickedNode.previousX, node.x);
                const interpolateSourceY = d3.interpolate(node.parent.y, node.y);

                if (node.data.scriptType === 'End') {
                    return function (t: number): string {
                        return `translate(${interpolateSourceY(t)},${node.x})`;
                    };
                }

                return function (t: number): string {
                    return `translate(${interpolateSourceY(t)},${interpolateSourceX(t)})`;
                };
            });
    }

    function handDragNode() {
        const dragStart = {x: 0, y: 0};
        const dragBehavior = d3.drag<any, D3Node>()
            .on('start', function (event, node) {
                if (node === rootNode) {
                    toast.error('根节点不可拖拽');
                    return;
                }

                dragStart.x = event.x;
                dragStart.y = event.y;

                const descendants = node.descendants();
                descendants.forEach((descendant) => {
                    descendant.relativeX = descendant.x - node.x;
                    descendant.relativeY = descendant.y - node.y;
                });
            })
            .on('drag', function (event, node) {
                treeStore.setDraggingNode(node);
                if (node === rootNode) {
                    toast.error('根节点不可拖拽');
                    return;
                }

                const dx = event.x - dragStart.x;
                const dy = event.y - dragStart.y;

                d3.select(`#${generateLinkId(node.parent!.data.scriptId, node.data.scriptId)}`)
                    .transition()
                    .duration(100)
                    .style('opacity', 0)
                    .on('end', function () {
                        d3.select(this).remove();
                    });

                node.x = dragStart.x + dy;
                node.y = dragStart.y + dx;

                node.descendants().forEach((descendant) => {
                    descendant.x = node.x + descendant.relativeX;
                    descendant.y = node.y + descendant.relativeY;
                    d3.select(`#node-${descendant.data.scriptId}`)
                        .attr('transform', descendant.data.scriptType === 'End'
                            ? `translate(${descendant.y - END_NODE_LENGTH},${descendant.x})`
                            : `translate(${descendant.y},${descendant.x})`);
                });

                d3.select(this).attr('transform', `translate(${node.y},${node.x})`);

                node.descendants().forEach((descendant) => {
                    const linkData = {source: descendant.parent, target: descendant} as D3Link;
                    d3.select(`#${generateLinkId(linkData.source.data.scriptId, linkData.target.data.scriptId)}`)
                        .attr('d', function () {
                            if (descendant.data.scriptType === 'End') {
                                const intermediatePointY = linkData.target.y - END_NODE_LENGTH;
                                const modifiedTarget = {x: linkData.target.x, y: intermediatePointY} as D3Node;
                                return d3.linkHorizontal<D3Link, D3Node>().x((item) => item.y).y((item) => item.x)({
                                    source: linkData.source,
                                    target: modifiedTarget,
                                });
                            }

                            return d3.linkHorizontal<D3Link, D3Node>().x((item) => item.y).y((item) => item.x)(linkData);
                        });
                });

                let closestNode = null;
                let minDistance = Infinity;
                rootNode.descendants().forEach((candidate) => {
                    if (candidate !== node && candidate.data.scriptType !== 'End') {
                        const distance = Math.sqrt((node.x - candidate.x) ** 2 + (node.y - candidate.y) ** 2);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestNode = candidate;
                        }
                    }
                });

                if (closestNode && minDistance < 120) {
                    treeChartState.closestNodeRef = closestNode;
                    gRef.select('.preview-line')
                        .style('opacity', 1)
                        .attr('d', d3.line()([[node.y, node.x], [(closestNode as D3Node).y, (closestNode as D3Node).x]]));
                } else {
                    treeChartState.closestNodeRef = null;
                    gRef.select('.preview-line').style('opacity', 0);
                }
            })
            .on('end', function (_event, node) {
                if (node === rootNode) {
                    toast.error('根节点不可拖拽');
                    return;
                }

                const closestNode = treeChartState.closestNodeRef;
                if (closestNode) {
                    const oldParentNode = node.parent!;
                    const parentChildren = oldParentNode.children;
                    if (parentChildren) {
                        oldParentNode.children = parentChildren.filter((child) => child !== node);
                        if (oldParentNode.children.length === 0) {
                            delete oldParentNode.children;
                        }
                    }

                    if (oldParentNode.data.children) {
                        for (let index = 0; index < oldParentNode.data.children.length; index += 1) {
                            if (oldParentNode.data.children[index].scriptId === node.data.scriptId) {
                                oldParentNode.data.children.splice(index, 1);
                            }
                        }
                    }

                    node.parent = closestNode;

                    if (!closestNode.children) {
                        closestNode.children = [];
                    }
                    updateNodeDepth(node, closestNode.depth + 1);
                    closestNode.children.push(node);

                    if (!closestNode.data.children) {
                        closestNode.data.children = [];
                    }
                    closestNode.data.children.push(node.data);

                    refresh(treeChartState);
                    gRef.select('.preview-line').style('opacity', 0);
                    treeChartState.closestNodeRef = null;
                    treeStore.setDraggingNode(null);
                    gRef.selectAll<SVGGElement, D3Node>('.node').on('.drag', null);
                }
            });

        gRef.selectAll<SVGGElement, D3Node>('.node').call(dragBehavior);
    }

    function isNextNodeEnd(menuNode: D3Node | null) {
        const children = menuNode?.data.children;
        return !!(children && children.length > 0 && children[0].scriptType === 'End');
    }

    const menuNode = treeStore.menuNode;
    const isEndNodeType = menuNode?.data.scriptType === 'End';
    const isStartNodeType = menuNode?.data.scriptType === 'Start';
    const nextNodeIsEnd = isNextNodeEnd(treeStore.menuNode);
    const hasChildren = !!(menuNode && menuNode.data.children && menuNode.data.children.length > 0);
    const hasEndChildNode = !!(menuNode && menuNode.data.children && menuNode.data.children.some((child) => child.scriptType === 'End'));

    const nodeActions = buildNodeActions({
        isEndNodeType,
        isStartNodeType,
        nextNodeIsEnd,
        hasChildren,
        hasEndChildNode,
        icons: {
            scriptIcon,
            conditionIcon,
            ruleIcon,
            endIcon,
            replaceIcon,
            deleteIcon,
            deleteTreeIcon,
            dragIcon,
        },
        handlers: {
            addScriptNode: () => handleScriptNode(treeStore.menuNode!, 'Script'),
            addConditionNode: () => handleConditionNode(treeStore.menuNode!),
            addRuleNode: () => handleScriptNode(treeStore.menuNode!, 'Rule'),
            addEndNode: () => handleAddNode(treeStore.menuNode!, 'End'),
            replaceNode: () => handleReplaceNode(treeStore.menuNode!),
            deleteNode: () => handleDeleteNode(treeStore.menuNode!),
            deleteTree: () => handleDeleteCurrentTree(treeStore.menuNode!),
            dragNode: () => handDragNode(),
        },
    });

    if (treeStore.draggingNode != null) {
        return null;
    }

    return <NodeMenuPopup actions={nodeActions} left={menuPosition.x - siderWidth} top={menuPosition.y}/>;
});

export default NodeMenu;
