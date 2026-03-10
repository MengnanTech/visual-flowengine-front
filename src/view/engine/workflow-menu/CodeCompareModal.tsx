import React, {Suspense} from 'react';
import CustomModal from '@/components/ui/CustomModal';

const CodeDiffViewer = React.lazy(() => import('@/components/editor/CodeDiffViewer.tsx'));

interface CodeCompareModalProps {
    open: boolean;
    title: string;
    originalCode: string;
    modifiedCode: string;
    onCancel: () => void;
    onLineClick?: (lineContent: string) => void;
    width?: string | number;
}

const CodeCompareModal: React.FC<CodeCompareModalProps> = ({
    open,
    title,
    originalCode,
    modifiedCode,
    onCancel,
    onLineClick,
    width = '90vw',
}) => {
    return (
        <CustomModal
            title={title}
            open={open}
            onCancel={onCancel}
            maskClosable={false}
            footer={null}
            width={width}
            style={{maxWidth: '92vw', maxHeight: '100vh', overflow: 'hidden'}}
        >
            <Suspense fallback={<div>Loading editor...</div>}>
                <CodeDiffViewer
                    language="groovy"
                    onLineClick={onLineClick}
                    originalCode={originalCode}
                    modifiedCode={modifiedCode}
                />
            </Suspense>
        </CustomModal>
    );
};

export default CodeCompareModal;
