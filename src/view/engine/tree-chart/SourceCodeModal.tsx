import React, {useEffect, useState} from 'react';
import CustomModal from '@/components/ui/CustomModal';
import {ensureMonacoSetup} from '@/components/editor/monacoSetup.ts';

interface SourceCodeModalProps {
    open: boolean;
    jsonData: string;
    onCancel: () => void;
}

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

const editorOptions = {
    scrollBeyondLastLine: false,
    readOnly: true,
};

const SourceCodeModal: React.FC<SourceCodeModalProps> = ({open, jsonData, onCancel}) => {
    const [isMonacoReady, setIsMonacoReady] = useState(false);

    useEffect(() => {
        if (!open || isMonacoReady) {
            return;
        }

        let disposed = false;

        ensureMonacoSetup().then(() => {
            if (!disposed) {
                setIsMonacoReady(true);
            }
        });

        return () => {
            disposed = true;
        };
    }, [isMonacoReady, open]);

    return (
        <CustomModal
            title="源代码"
            open={open}
            onCancel={onCancel}
            maskClosable={false}
            footer={null}
            width={1000}
        >
            {isMonacoReady ? (
                <React.Suspense fallback={<div>Loading editor...</div>}>
                    <MonacoEditor
                        height="70vh"
                        defaultLanguage="json"
                        value={jsonData}
                        options={editorOptions}
                    />
                </React.Suspense>
            ) : (
                <div>Loading editor...</div>
            )}
        </CustomModal>
    );
};

export default SourceCodeModal;
