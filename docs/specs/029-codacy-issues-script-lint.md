# Spec: Codacy Issues Script Lint Fixes

## ID

029-codacy-issues-script-lint

## Goal

Make `scripts/codacy-issues.js` pass oxlint without changing its functional output.

## In Scope

- Avoid `no-undef` violations for Node globals used in the script
- Ensure `curly` rule compliance
- Avoid sending a request body with `GET`
- Keep output on stdout and errors on stderr

## Out of Scope

- Behavior changes to Codacy API requests
- New features or flags

## Behavior

- Script output format remains JSON on stdout
- Errors remain printed to stderr and exit with non-zero status

## Done When

- `scripts/codacy-issues.js` passes oxlint
- Output/CLI usage behavior is unchanged
