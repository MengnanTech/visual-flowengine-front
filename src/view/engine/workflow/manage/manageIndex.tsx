import React from "react";
import {Editor} from "@monaco-editor/react";

const ManageIndex: React.FC = () => {



    function handleEditorChange(value: any, event: any) {
        console.log("onMount: the value instance:", value);
        console.log("onMount: the event instance:", event);
    }

    function handleEditorDidMount(editor: any, monaco: any) {
        console.log("onMount: the editor instance:", editor);
        console.log("onMount: the monaco instance:", monaco);
    }

    function handleEditorWillMount(monaco: any) {
        console.log("beforeMount: the monaco instance:", monaco);
    }

    function handleEditorValidation(markers: any[]) {
        // model markers
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }
        return (
        <div>
            <Editor
                height="90vh"
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                beforeMount={handleEditorWillMount}
                onValidate={handleEditorValidation}
                defaultLanguage="java"
                defaultValue="// some comment"
            />
        </div>
    );
}
export default ManageIndex