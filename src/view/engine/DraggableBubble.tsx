import React, { useState, useRef } from 'react';
import styles from './styles/DraggableBubble.module.scss';
import { DragOutlined } from "@ant-design/icons";

const DraggableBubble: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 700, y: -200 });
    const lastRafId = useRef<number>();

    const handleDragMove = (e: MouseEvent) => {
        if (!bubbleRef.current) return;

        // 限制requestAnimationFrame的调用
        if (!lastRafId.current) {
            lastRafId.current = requestAnimationFrame(() => {
                if (bubbleRef.current && lastRafId.current) {
                    const dx = e.clientX - dragStartRef.current.x;
                    const dy = e.clientY - dragStartRef.current.y;
                    const newX = positionRef.current.x + dx;
                    const newY = positionRef.current.y + dy;

                    bubbleRef.current.style.transform = `translate(${newX}px, ${newY}px)`;

                    // 更新positionRef和dragStartRef为下一帧准备
                    positionRef.current = { x: newX, y: newY };
                    dragStartRef.current = { x: e.clientX, y: e.clientY };

                    // 清除lastRafId以允许下一个requestAnimationFrame调用
                    lastRafId.current = undefined
                }
            });
        }
    };

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragEnd = () => {
        if (lastRafId.current) cancelAnimationFrame(lastRafId.current);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
    };

    return (
        <div
            ref={bubbleRef}
            className={`${styles.bubble} ${isExpanded ? styles.expanded : ''}`}
            onMouseDown={handleDragStart}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)` }}
        >
            菜单
            <DragOutlined className={styles.dragIcon} style={{ position: 'absolute', top: '-25px', cursor: 'grab' }}/>
        </div>
    );
};

export default DraggableBubble;
