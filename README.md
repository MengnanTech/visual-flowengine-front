# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md)
  uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast
  Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked`
  or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and
  add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## TODO

- Fix the workflow code compare `scriptText` marker in Monaco diff view. Current status: compare flow still works, but the expected red dot marker is not visible in the gutter/margin after the editor refactor and Monaco lazy loading changes.
- Debug direction for the `scriptText` marker issue:
  verify Monaco decorations are created at runtime,
  inspect gutter DOM/classes in the diff editor,
  confirm the marker is attached to the correct side of the diff editor,
  and check whether the current CSS module class is being applied inside Monaco's rendered gutter nodes.
- Work already done for the `scriptText` marker issue:
  enabled `glyphMargin` in `CodeDiffViewer`,
  switched Monaco line decorations from `marginClassName` to `glyphMarginClassName`,
  rewrote `src/components/editor/style/diff.module.scss` to use a stable red-dot marker style,
  and rebuilt successfully.
  Result so far: build passes, compare modal still opens and line click handling remains in place, but the gutter red dot is still not rendered visibly.
