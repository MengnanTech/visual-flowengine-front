import React, {Suspense} from 'react';
import CustomModal from '@/components/ui/CustomModal';
import CustomCollapse, {CollapseItem} from '@/components/ui/Collapse';

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

interface EditorDebugModalProps {
    open: boolean;
    isMonacoReady: boolean;
    debugValue: string;
    debugOutput: string;
    readonly: boolean;
    activeKey: string;
    collapseItems: CollapseItem[];
    onCancel: () => void;
    onSubmit: (event: React.FormEvent) => void;
    onDebugJsonChange: (value: string | undefined) => void;
    onCollapseChange: (keys: string | string[]) => void;
}

const submitButtonStyle: React.CSSProperties = {
    padding: '6px 16px',
    background: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
    width: '100%',
};

const EditorDebugModal: React.FC<EditorDebugModalProps> = ({
    open,
    isMonacoReady,
    debugValue,
    activeKey,
    collapseItems,
    onCancel,
    onSubmit,
    onDebugJsonChange,
    onCollapseChange,
}) => {
    return (
        <CustomModal
            title="Debug Node"
            open={open}
            onCancel={onCancel}
            maskClosable={false}
            footer={null}
            width={1000}
            style={{height: '95vh'}}
            draggable
        >
            <form onSubmit={onSubmit} autoComplete="off" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <div>
                    <label style={{display: 'block', marginBottom: 4, fontSize: 14}}>JSON Content</label>
                    <div
                        style={{
                            border: '1px solid #e1e4e8',
                            background: '#f6f8fa',
                            borderRadius: '4px',
                            padding: '10px',
                        }}
                    >
                        {isMonacoReady ? (
                            <Suspense fallback={<div>Loading editor...</div>}>
                                <MonacoEditor
                                    height="300px"
                                    defaultLanguage="json"
                                    onChange={onDebugJsonChange}
                                    value={debugValue}
                                    options={{scrollBeyondLastLine: false, fontSize: 16}}
                                />
                            </Suspense>
                        ) : (
                            <div>Loading editor...</div>
                        )}
                    </div>
                </div>
                <button type="submit" style={submitButtonStyle}>Submit</button>
                <CustomCollapse
                    onChange={onCollapseChange}
                    activeKey={activeKey}
                    bordered={true}
                    items={collapseItems}
                />
            </form>
        </CustomModal>
    );
};

export default EditorDebugModal;
