import React, {useState} from 'react';
import {WorkflowMetadata} from '@/components/model/WorkflowModel.ts';
import EditDetailsModal from './EditDetailsModal';
import styles from './styles/InfoBar.module.scss';

interface WorkflowInfoBarProps {
    treeData: WorkflowMetadata;
    onSave: (data: WorkflowMetadata) => Promise<void>;
}

const WorkflowInfoBar: React.FC<WorkflowInfoBarProps> = ({treeData, onSave}) => {
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <>
            <div className={styles.infoBar}>
                <div className={styles.left}>
                    <span className={styles.name}>{treeData.workflowName}</span>
                    <span className={styles.id}>(ID: {treeData.workflowId})</span>
                </div>
                <div className={styles.right}>
                    {treeData.workflowPurpose && (
                        <span className={styles.purpose} title={treeData.workflowPurpose}>
                            {treeData.workflowPurpose}
                        </span>
                    )}
                    <button
                        className={styles.editLink}
                        onClick={() => setShowEditModal(true)}
                    >
                        Edit Details
                    </button>
                </div>
            </div>
            {showEditModal && (
                <EditDetailsModal
                    treeData={treeData}
                    onSave={onSave}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
};

export default WorkflowInfoBar;
