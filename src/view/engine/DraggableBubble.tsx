import React, {useState, useRef, useEffect} from 'react';
import styles from './styles/DraggableBubble.module.scss';
import { DragOutlined } from "@ant-design/icons";

const DraggableBubble: React.FC = () => {
    const [bubblePosition, setBubblePosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDragStart = (e:any) => {
        setIsDragging(true);
        // 防止在拖动时发生选中文本的默认行为
        e.preventDefault();
        bubbleRef.current = {
            offsetX: e.clientX - bubblePosition.x,
            offsetY: e.clientY - bubblePosition.y,
        };
    };

    const handleDragMove = (e) => {
        if (isDragging) {
            const x = e.clientX - bubbleRef.current.offsetX;
            const y = e.clientY - bubbleRef.current.offsetY;
            setBubblePosition({ x, y });
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
        <div
            style={{
                left: `${bubblePosition.x}px`,
                top: `${bubblePosition.y}px`,
            }}
            className={`${styles.bubble} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            菜单
            <DragOutlined className={styles.dragIcon}  onMouseDown={handleDragStart} style={{ position: 'absolute', top: '-25px', cursor: 'grab' }}/>
        </div>
    );
};

export default DraggableBubble;
