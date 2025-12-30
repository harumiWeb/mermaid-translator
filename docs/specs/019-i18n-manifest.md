# Spec: Manifest Localization

## ID

019-i18n-manifest

## Goal

Localize the extension name and description via Chrome i18n.

## In Scope

- Use `__MSG_...__` placeholders for `name` and `description` in `manifest.json`
- Provide localized strings for `en`, `ja`, `ko`, `zh_CN`

## Out of Scope

- UI text localization inside the popup or action buttons
- Runtime language switching

## Behavior

- `default_locale` remains `en`
- Missing locale strings fall back to default locale

## Done When

- `manifest.json` references i18n keys
- Locale message files contain the required keys
