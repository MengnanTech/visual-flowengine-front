import React, {useCallback, useRef, useState} from 'react';
import {MenuItemsIdAndName} from '@/components/model/WorkflowModel.ts';
import SidebarItem from './SidebarItem';
import ContextMenu from './ContextMenu';
import styles from './styles/Sidebar.module.scss';
import logo from '@/assets/logo/logo.jpeg';

interface SidebarProps {
    width: number;
    onWidthChange: (width: number) => void;
    items: MenuItemsIdAndName[];
    selectedKey: string;
    onSelect: (item: MenuItemsIdAndName) => void;
    onAddWorkflow: () => void;
    onRename: (id: number, newName: string) => void;
    onDelete: (id: number) => void;
    onLogoClick: () => void;
    floating?: boolean;
    showCreateButton?: boolean;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    itemId: number;
}

const Sidebar: React.FC<SidebarProps> = ({
    width,
    onWidthChange,
    items,
    selectedKey,
    onSelect,
    onAddWorkflow,
    onRename,
    onDelete,
    onLogoClick,
    floating = false,
    showCreateButton = true,
}) => {
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        itemId: 0,
    });
    const isResizing = useRef(false);

    const handleResizeStart = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        isResizing.current = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.min(Math.max(moveEvent.clientX, 240), 520);
            onWidthChange(newWidth);
        };

        const onMouseUp = () => {
            isResizing.current = false;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [onWidthChange]);

    const openContextMenu = (itemId: number, x: number, y: number) => {
        setContextMenu({visible: true, x, y, itemId});
    };

    const closeContextMenu = () => {
        setContextMenu((prev) => ({...prev, visible: false}));
    };

    const handleContextMenuAction = (action: 'rename' | 'delete') => {
        if (action === 'rename') {
            setEditingKey(contextMenu.itemId);
        } else {
            onDelete(contextMenu.itemId);
        }
    };

    return (
        <div
            className={`${styles.sidebar} ${floating ? styles.sidebarFloating : ''}`}
            style={{width}}
            onClick={floating ? (event) => event.stopPropagation() : undefined}
        >
            <div className={styles.logo} onClick={onLogoClick}>
                <img src={logo} alt="logo"/>
                <span>可视化流程引擎</span>
            </div>

            {showCreateButton && (
                <button className={styles.newButton} onClick={onAddWorkflow}>
                    + New Workflow
                </button>
            )}

            <div className={styles.list}>
                {items.length === 0 && (
                    <div className={styles.empty}>暂无工作流</div>
                )}
                {items.map((item) => (
                    <SidebarItem
                        key={item.workflowId}
                        item={item}
                        isSelected={String(item.workflowId) === selectedKey}
                        isEditing={editingKey === item.workflowId}
                        onSelect={() => onSelect(item)}
                        onRenameSubmit={(newName) => {
                            onRename(item.workflowId, newName);
                            setEditingKey(null);
                        }}
                        onRenameCancel={() => setEditingKey(null)}
                        onContextMenu={(event) => {
                            event.preventDefault();
                            openContextMenu(item.workflowId, event.clientX, event.clientY);
                        }}
                        onMoreClick={(event) => {
                            const rect = (event.target as HTMLElement).getBoundingClientRect();
                            openContextMenu(item.workflowId, rect.right, rect.bottom);
                        }}
                        contextMenuVisible={contextMenu.visible && contextMenu.itemId === item.workflowId}
                    />
                ))}
            </div>

            <div className={styles.resizeHandle} onMouseDown={handleResizeStart}/>

            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onRename={() => handleContextMenuAction('rename')}
                    onDelete={() => handleContextMenuAction('delete')}
                    onClose={closeContextMenu}
                />
            )}
        </div>
    );
};

export default Sidebar;
