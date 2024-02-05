import React, {useState, useRef} from 'react';
import styles from './styles/DraggableBubble.module.scss'; // 根据实际路径调整
import {DragOutlined} from "@ant-design/icons";

const DraggableBubble: React.FC = () => {
    const [position, setPosition] = useState({x: 100, y: 100});
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({x: 0, y: 0});
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDragStart = (e:any) => {
        e.preventDefault(); // 防止默认行为
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e:any) => {
        if (isDragging) {
            requestAnimationFrame(() => {
                setPosition({
                    x: e.clientX - dragStartRef.current.x,
                    y: e.clientY - dragStartRef.current.y,
                });
            });
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
    };

    return (
        <div
            className={`${styles.bubble} ${isExpanded ? styles.expanded : ''}`}
            style={{left: `${position.x}px`, top: `${position.y}px`}}
            onClick={(e) => {
                console.log('click',e);
                // 防止在拖动结束时触发
                if (!isDragging) setIsExpanded(!isExpanded);
            }}
        >
            菜单
            <DragOutlined
                className={styles.dragIcon}
                onMouseDown={handleDragStart}
                style={{position: 'absolute', top: '-25px', cursor: 'grab'}}
            />
        </div>
    );
};
export default DraggableBubble;
