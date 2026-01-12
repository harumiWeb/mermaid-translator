export const mermaidThemeOptions = [
  { value: 'system', label: 'System' },
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'forest', label: 'Forest' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'base', label: 'Base' },
] as const;

export const popupThemeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

export type MermaidThemePreference =
  (typeof mermaidThemeOptions)[number]['value'];
export type MermaidThemeName = Exclude<MermaidThemePreference, 'system'>;
export type PopupThemePreference = (typeof popupThemeOptions)[number]['value'];

export function isMermaidThemePreference(
  value: string
): value is MermaidThemePreference {
  return mermaidThemeOptions.some((option) => option.value === value);
}

export function isPopupThemePreference(
  value: string
): value is PopupThemePreference {
  return popupThemeOptions.some((option) => option.value === value);
}
