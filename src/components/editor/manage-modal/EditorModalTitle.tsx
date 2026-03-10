import React from 'react';
import {
    CheckCircleFilledIcon,
    CopyFilledIcon,
    EditFilledIcon,
    FullscreenExitOutlinedIcon,
    FullscreenOutlinedIcon,
} from '@/components/ui/icons';
import AutoWidthInput from '@/components/editor/AutoWidthInput.tsx';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {D3Node} from '@/components/D3Node/NodeModel.ts';

interface EditorModalTitleProps {
    clickNode: D3Node | null;
    title: string;
    isEditing: boolean;
    isFullScreen: boolean;
    showConfirmation: boolean;
    onTitleChange: (value: string) => void;
    onToggleEditing: () => void;
    onToggleFullScreen: () => void;
    onCopySuccess: () => void;
}

const descRow = (label: string, children: React.ReactNode) => (
    <div style={{display: 'flex', alignItems: 'center', minHeight: 28, gap: 8, marginBottom: 4}}>
        <span style={{color: '#666', fontSize: 13, whiteSpace: 'nowrap', width: 90, flexShrink: 0}}>{label}</span>
        <div style={{flex: 1, minWidth: 0}}>{children}</div>
    </div>
);

const EditorModalTitle: React.FC<EditorModalTitleProps> = ({
    clickNode,
    title,
    isEditing,
    isFullScreen,
    showConfirmation,
    onTitleChange,
    onToggleEditing,
    onToggleFullScreen,
    onCopySuccess,
}) => {
    return (
        <div>
            {descRow('Node ID', (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span>{clickNode?.data.scriptId}</span>
                    <CopyToClipboard text={clickNode?.data.scriptId || ''} onCopy={onCopySuccess}>
                        <span title="复制" style={{cursor: 'pointer', marginLeft: 4}}>
                            <CopyFilledIcon style={{color: 'gray', width: 14, height: 14}}/>
                        </span>
                    </CopyToClipboard>
                    {showConfirmation && (
                        <CheckCircleFilledIcon style={{color: '#36f33e', fontSize: '16px', width: 16, height: 16, marginLeft: 4}}/>
                    )}
                </div>
            ))}
            {descRow('Node Name', (
                <div style={{display: 'flex', alignItems: 'center', height: '22px'}}>
                    {isEditing ? (
                        <AutoWidthInput value={title} onChange={onTitleChange} onFinish={onToggleEditing}/>
                    ) : (
                        <>
                            <span style={{lineHeight: '32px'}}>{title}</span>
                            <span onClick={onToggleEditing} style={{cursor: 'pointer', marginLeft: 'auto'}}>
                                <EditFilledIcon style={{width: 14, height: 14}}/>
                            </span>
                        </>
                    )}
                </div>
            ))}
            {descRow('Node Type', <span>{clickNode?.data.scriptType}</span>)}
            {descRow('Node Status', (
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                    <span style={{width: 8, height: 8, borderRadius: '50%', background: 'green', display: 'inline-block'}}/>
                    Running
                </span>
            ))}
            <button
                onClick={onToggleFullScreen}
                style={{
                    position: 'absolute',
                    right: 50,
                    top: 13,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 4,
                }}
            >
                {isFullScreen
                    ? <FullscreenExitOutlinedIcon style={{width: 16, height: 16}}/>
                    : <FullscreenOutlinedIcon style={{width: 16, height: 16}}/>
                }
            </button>
        </div>
    );
};

export default EditorModalTitle;
