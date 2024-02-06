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

        // 计算新的位置
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newX = positionRef.current.x + dx;
        const newY = positionRef.current.y + dy;

        // 更新元素的位置
        requestAnimationFrame(() => {
            if (bubbleRef.current) {
                bubbleRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
            }
        });

        // 更新positionRef以便下次计算使用
        positionRef.current = { x: newX, y: newY };

        // 重置dragStartRef以便下一帧计算
        dragStartRef.current = { x: e.clientX, y: e.clientY };
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
