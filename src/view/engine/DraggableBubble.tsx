import React, {useState, useRef, useEffect} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import {DragOutlined} from "@ant-design/icons";

interface BubbleRef {
    offsetX: number;
    offsetY: number;
}

const DraggableBubble: React.FC = () => {
    const [bubblePosition, setBubblePosition] = useState({x: 100, y: 100});
    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef<BubbleRef | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsDragging(true);

        e.preventDefault();
        bubbleRef.current = {
            offsetX: e.clientX - bubblePosition.x,
            offsetY: e.clientY - bubblePosition.y,
        };
    };

    const handleDragMove = (e: MouseEvent) => {
        if (isDragging) {
            const x = e.clientX - bubbleRef.current!.offsetX;
            const y = e.clientY - bubbleRef.current!.offsetY;
            setBubblePosition({x, y});
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        } else {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);


    return (
        <>
            <div
                style={{
                    left: `${bubblePosition.x}px`,
                    top: `${bubblePosition.y}px`,
                    transition: isDragging ? 'none' : 'all 0.3s ease',
                }}
                className={`${styles.bubble} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                菜单

            </div>
            <DragOutlined className={styles.dragIcon} onMouseDown={handleDragStart}
                          style={{
                              transition: isDragging ? 'none' : 'all 0.3s ease',
                              position: 'absolute',
                              cursor: 'grab',
                              left: `${isExpanded ?bubblePosition.x -2: bubblePosition.x + 20}px`,
                              top: `${isExpanded ? bubblePosition.y - 5:bubblePosition.y - 15}px`,
                          }}/>
        </>

    );
};

export default DraggableBubble;
