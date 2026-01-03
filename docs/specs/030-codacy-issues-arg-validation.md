# Spec: Codacy Issues Script Arg Validation

## ID

030-codacy-issues-arg-validation

## Goal

Harden `scripts/codacy-issues.js` argument handling while preserving existing behavior.

## In Scope

- Allow git provider auto-detection to override the default
- Validate presence of values for `--pr`, `--min-level`, `--provider`
- Validate `--min-level` against known levels

## Out of Scope

- New CLI flags
- Changes to Codacy API request behavior

## Behavior

- Missing flag values result in a clear error and non-zero exit
- Invalid `--min-level` results in a clear error and non-zero exit
- Provider defaults to auto-detected value when available; otherwise falls back to GitHub

## Done When

- `scripts/codacy-issues.js` passes oxlint
- Reported issues are addressed without changing normal output format
