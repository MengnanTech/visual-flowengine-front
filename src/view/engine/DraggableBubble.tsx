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
        if (lastRafId.current) cancelAnimationFrame(lastRafId.current);

        lastRafId.current = requestAnimationFrame(() => {
            const dx = e.clientX - dragStartRef.current.x + positionRef.current.x;
            const dy = e.clientY - dragStartRef.current.y + positionRef.current.y;
            bubbleRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        });
    };

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragEnd = () => {
        if (lastRafId.current) cancelAnimationFrame(lastRafId.current);
        if (bubbleRef.current) {
            const style = window.getComputedStyle(bubbleRef.current);
            const matrix = new DOMMatrixReadOnly(style.transform);
            positionRef.current = { x: matrix.m41, y: matrix.m42 };
        }
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
