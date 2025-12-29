# Spec: Build Output Assets

## ID

006-build-output

## Goal

Ensure build output includes required static assets for the extension
without manual copying.

## In Scope

- Output `manifest.json` to `dist/manifest.json`
- Output `src/content/style.css` to `dist/content/style.css`
- Output content script bundle to `dist/content/main.js`

## Out of Scope

- Background scripts
- Additional asset pipelines
- Runtime asset loading changes

## Behavior

- Build emits the above files every time
- Missing source files should fail the build

## Done When

- `dist/manifest.json` exists after build
- `dist/content/style.css` exists after build
- `dist/content/main.js` exists after build
