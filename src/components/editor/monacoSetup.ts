export type MonacoModule = typeof import('monaco-editor/esm/vs/editor/editor.api');

let monacoSetupPromise: Promise<MonacoModule> | null = null;

export function ensureMonacoSetup(): Promise<MonacoModule> {
    if (!monacoSetupPromise) {
        monacoSetupPromise = (async () => {
            const [{loader}, monaco, jsonWorkerModule, editorWorkerModule] = await Promise.all([
                import('@monaco-editor/react'),
                import('monaco-editor/esm/vs/editor/editor.api'),
                import('monaco-editor/esm/vs/language/json/json.worker?worker'),
                import('monaco-editor/esm/vs/editor/editor.worker?worker'),
            ]);

            await Promise.all([
                import('monaco-editor/esm/vs/language/json/monaco.contribution'),
                import('monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController'),
                import('monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestInlineCompletions'),
                import('monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard'),
                import('monaco-editor/esm/vs/editor/contrib/folding/browser/folding'),
                import('monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu'),
                import('monaco-editor/esm/vs/editor/contrib/comment/browser/comment'),
                import('monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css'),
            ]);

            (
                self as typeof self & {
                    MonacoEnvironment?: {
                        getWorker: (_workerId: string, label: string) => Worker;
                    };
                }
            ).MonacoEnvironment = {
                getWorker(_: string, label: string) {
                    if (label === 'json') {
                        return new jsonWorkerModule.default();
                    }

                    return new editorWorkerModule.default();
                },
            };

            loader.config({monaco});

            return monaco;
        })();
    }

    return monacoSetupPromise;
}
