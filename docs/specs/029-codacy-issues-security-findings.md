# Spec: Codacy Issues Script Security Findings

## ID

029-codacy-issues-security-findings

## Goal

Address Codacy security findings in `scripts/codacy-issues.js` without changing output format.

## In Scope

- Avoid object-injection warnings in argument parsing
- Avoid SSRF warning by using a fixed host HTTP client

## Out of Scope

- New CLI flags
- Output format changes

## Behavior

- URLs are built from the fixed Codacy base host and validated path segments
- CLI behavior remains unchanged

## Done When

- Codacy findings for object injection and SSRF are resolved
