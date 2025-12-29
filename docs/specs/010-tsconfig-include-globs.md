# Spec: TSConfig Include Globs

## ID

010-tsconfig-include-globs

## Goal

Make the TypeScript project inputs explicit so type-aware linting
always finds source files.

## In Scope

- Update `tsconfig.json` to include explicit `src/**/*.ts` and
  `src/**/*.tsx` globs

## Out of Scope

- Changing compiler options unrelated to file inclusion

## Done When

- `pnpm lint` no longer fails with "no files specified in config"
