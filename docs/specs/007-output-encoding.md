# Spec: Build Output Encoding

## ID

007-output-encoding

## Goal

Ensure build outputs for content scripts are UTF-8 without BOM so
Chrome can load them reliably.

## In Scope

- Normalize `dist/content/main.js` to UTF-8 (no BOM) after build
- Ensure build output uses ASCII-safe encoding

## Out of Scope

- Changing runtime logic
- Modifying other assets unless required

## Done When

- `dist/content/main.js` is UTF-8 without BOM after `pnpm build`
- `dist/content/main.js` contains only ASCII bytes
