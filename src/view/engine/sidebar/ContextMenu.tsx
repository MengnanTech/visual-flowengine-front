import React, {useEffect, useRef, useState} from 'react';
import styles from './styles/ContextMenu.module.scss';
import modalStyles from './styles/Modal.module.scss';

interface ContextMenuProps {
    x: number;
    y: number;
    onRename: () => void;
    onDelete: () => void;
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({x, y, onRename, onDelete, onClose}) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Clamp position to viewport
    const [pos, setPos] = useState({x, y});

    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const clampedX = Math.min(x, window.innerWidth - rect.width - 8);
            const clampedY = Math.min(y, window.innerHeight - rect.height - 8);
            setPos({x: Math.max(8, clampedX), y: Math.max(8, clampedY)});
        }
    }, [x, y]);

    if (showConfirm) {
        return (
            <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
                <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.confirmText}>
                        确认删除此工作流？此操作无法撤销。
                    </div>
                    <div className={styles.confirmActions}>
                        <button
                            className={`${modalStyles.btn} ${modalStyles.btnDefault}`}
                            onClick={() => {
                                setShowConfirm(false);
                                onClose();
                            }}
                        >
                            取消
                        </button>
                        <button
                            className={`${modalStyles.btn} ${modalStyles.btnDanger}`}
                            onClick={() => {
                                onDelete();
                                onClose();
                            }}
                        >
                            确认删除
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.overlay} onClick={onClose}/>
            <div
                ref={menuRef}
                className={styles.menu}
                style={{left: pos.x, top: pos.y}}
            >
                <div
                    className={styles.menuItem}
                    onClick={() => {
                        onRename();
                        onClose();
                    }}
                >
                    Rename
                </div>
                <div
                    className={`${styles.menuItem} ${styles.danger}`}
                    onClick={() => setShowConfirm(true)}
                >
                    Delete
                </div>
            </div>
        </>
    );
};

export default ContextMenu;
