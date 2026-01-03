# Spec: Codacy Issues Script Buffer Usage

## ID

029-codacy-issues-buffer

## Goal

Ensure `scripts/codacy-issues.js` passes oxlint while keeping behavior unchanged.

## In Scope

- Define `Buffer` in the script for Content-Length calculation

## Out of Scope

- Output format changes
- New CLI flags

## Behavior

- Content-Length calculation remains correct
- Script behavior remains unchanged

## Done When

- `scripts/codacy-issues.js` passes oxlint without `no-undef` for `Buffer`
