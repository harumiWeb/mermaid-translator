# Spec: GitHub Workflows (CodeQL, Vitest, Oxlint)

## ID

020-ci-workflows

## Goal

Add GitHub Actions workflows for CodeQL analysis, Vitest tests, and Oxlint.

## In Scope

- CodeQL workflow for JavaScript/TypeScript
- Vitest workflow running `pnpm test`
- Oxlint workflow running `pnpm lint`

## Out of Scope

- Coverage reporting
- Deployment or release workflows
- Formatting enforcement

## Behavior

- Workflows run on push and pull_request
- CodeQL also runs on a weekly schedule
- Use pnpm with caching

## Done When

- `.github/workflows/codeql.yml` exists and runs CodeQL
- `.github/workflows/vitest.yml` exists and runs tests
- `.github/workflows/oxlint.yml` exists and runs lint
