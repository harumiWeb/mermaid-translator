# Spec: Dev Logging Flag

## ID

007-dev-logging-flag

## Goal

Allow optional logging in production builds via an explicit build-time flag.

## In Scope

- Provide a build-time flag that enables logging in production builds
- Default behavior remains "no logging in production"
- Logging output remains internal-only (console) and non-blocking

## Out of Scope

- Runtime toggles or UI switches
- Persistent settings
- Background scripts or storage

## Behavior

- When the build flag is enabled, selection logs are emitted even in production builds
- When the flag is disabled, production builds emit no logs
- Development builds continue to emit logs as before

## Error Handling

- Logging must never throw
- Logging must not affect user interaction

## Done When

- A build flag can enable production logging
- Default production builds produce no logs
