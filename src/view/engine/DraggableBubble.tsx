import React, { useState, useRef } from 'react';
import styles from './styles/DraggableBubble.module.scss'; // 确保路径正确
import { DragOutlined } from "@ant-design/icons";

const DraggableBubble: React.FC = () => {
    console.log("DraggableBubble rendered.");
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDragMove = (e: MouseEvent) => {
        if (isDraggingRef.current) {
            requestAnimationFrame(() => {
                const newX = e.clientX - dragStartRef.current.x;
                const newY = e.clientY - dragStartRef.current.y;
                setPosition({ x: newX, y: newY });
            });
        }
    };

    const handleDragEnd = () => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
    };

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    return (
        <div
            className={`${styles.bubble} ${isExpanded ? styles.expanded : ''}`}
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <DragOutlined
                className={styles.dragIcon}
                onMouseDown={handleDragStart}
                style={{ position: 'absolute', top: '-25px', cursor: 'grab' }}
            />
        </div>
    );
};

export default DraggableBubble;
