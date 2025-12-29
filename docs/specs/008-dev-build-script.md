# Spec: Dev Build Script

## ID

008-dev-build-script

## Goal

Provide a package script for a production build that enables
explicit logging via the build-time flag.

## In Scope

- Add a `build:dev` script that sets `VITE_ENABLE_LOGGING=true`
  and runs `vite build`
- Use `cross-env` for shell-agnostic environment variable support

## Out of Scope

- Changes to runtime behavior beyond the existing logging flag
- Additional build pipelines

## Behavior

- `pnpm build:dev` produces the same output as `pnpm build`,
  but with logging enabled in production bundles

## Done When

- `package.json` includes `build:dev` using `cross-env`
- Running `pnpm build:dev` sets the flag as intended
