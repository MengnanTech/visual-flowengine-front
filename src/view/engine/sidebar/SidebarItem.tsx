import React, {useRef, useEffect} from 'react';
import {MenuItemsIdAndName} from '@/components/model/WorkflowModel.ts';
import styles from './styles/Sidebar.module.scss';

interface SidebarItemProps {
    item: MenuItemsIdAndName;
    isSelected: boolean;
    isEditing: boolean;
    onSelect: () => void;
    onRenameSubmit: (newName: string) => void;
    onRenameCancel: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onMoreClick: (e: React.MouseEvent) => void;
    contextMenuVisible: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    isSelected,
    isEditing,
    onSelect,
    onRenameSubmit,
    onRenameCancel,
    onContextMenu,
    onMoreClick,
    contextMenuVisible,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = e.currentTarget.value.trim();
            if (value) {
                onRenameSubmit(value);
            }
        } else if (e.key === 'Escape') {
            onRenameCancel();
        }
    };

    const handleBlur = () => {
        onRenameCancel();
    };

    return (
        <div
            className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
            onClick={isEditing ? undefined : onSelect}
            onContextMenu={onContextMenu}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    className={styles.renameInput}
                    defaultValue={item.workflowName}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <>
                    <span className={styles.itemName}>{item.workflowName}</span>
                    <button
                        className={`${styles.moreBtn} ${contextMenuVisible ? styles.moreBtnVisible : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoreClick(e);
                        }}
                        title="More actions"
                    >
                        &#x2026;
                    </button>
                </>
            )}
        </div>
    );
};

export default SidebarItem;
