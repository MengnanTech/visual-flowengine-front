import React, {useEffect, useRef, useState} from 'react';
import Draggable, {DraggableData, DraggableEvent} from 'react-draggable';
import styles from './CustomModal.module.scss';

interface CustomModalProps {
    open: boolean;
    title?: React.ReactNode;
    onCancel: () => void;
    footer?: React.ReactNode | null;
    width?: string | number;
    style?: React.CSSProperties;
    centered?: boolean;
    maskClosable?: boolean;
    draggable?: boolean;
    children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
    open,
    title,
    onCancel,
    footer,
    width = 520,
    style,
    maskClosable = true,
    draggable = false,
    children,
}) => {
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({left: 0, top: 0, bottom: 0, right: 0});
    const draggleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onCancel();
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, onCancel]);

    if (!open) return null;

    const onDragStart = (_event: DraggableEvent, uiData: DraggableData) => {
        const {clientWidth, clientHeight} = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) return;
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    const handleBackdropClick = () => {
        if (maskClosable) onCancel();
    };

    const panelStyle: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        ...style,
    };

    const panelContent = (
        <div
            ref={draggleRef}
            className={styles.panel}
            style={panelStyle}
            onClick={(e) => e.stopPropagation()}
        >
            {title !== undefined && (
                <div
                    className={styles.header}
                    onMouseOver={() => draggable && setDisabled(false)}
                    onMouseOut={() => draggable && setDisabled(true)}
                    style={draggable ? {cursor: 'move'} : undefined}
                >
                    <div className={styles.title}>{title}</div>
                    <button className={styles.closeBtn} onClick={onCancel}>
                        &times;
                    </button>
                </div>
            )}
            <div className={styles.body}>{children}</div>
            {footer !== null && footer !== undefined && (
                <div className={styles.footer}>{footer}</div>
            )}
        </div>
    );

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            {draggable ? (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    nodeRef={draggleRef}
                    onStart={onDragStart}
                >
                    {panelContent}
                </Draggable>
            ) : (
                panelContent
            )}
        </div>
    );
};

export default CustomModal;
