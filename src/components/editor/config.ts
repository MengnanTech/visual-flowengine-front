import  { loader } from '@monaco-editor/react';

export default function LoadEditor(){
    loader.config({
        paths: {
            vs: 'src/components/editor/vs',
        },
    });
}