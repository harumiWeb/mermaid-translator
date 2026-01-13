# Spec: Pin TypeDoc Deploy Pages Action SHA

## ID

036-typedoc-deploy-pages-sha

## Goal

Pin the TypeDoc Pages deploy workflow action to a recommended fixed SHA
to avoid invalid or unverifiable action revisions.

## In Scope

- Update the `actions/deploy-pages` reference in
  `.github/workflows/typedoc-pages.yml` to a valid fixed SHA.

## Out of Scope

- Changes to other workflows
- Behavior changes to the TypeDoc generation or deployment steps

## Behavior

- The workflow uses the fixed SHA for `actions/deploy-pages`.

## Done When

- `.github/workflows/typedoc-pages.yml` is updated to the recommended SHA.
