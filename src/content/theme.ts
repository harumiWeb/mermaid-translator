export const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'forest', label: 'Forest' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'base', label: 'Base' },
] as const;

export type ThemePreference = (typeof themeOptions)[number]['value'];
export type ThemeName = Exclude<ThemePreference, 'system'>;
export type PopupThemePreference = 'system' | 'light' | 'dark';

const themeStorageKey = 'mermaid-selection-renderer:theme';
const popupThemeStorageKey = 'mermaid-selection-renderer:popup-theme';

export function loadThemePreference(): ThemePreference {
  try {
    const raw = window.localStorage.getItem(themeStorageKey);
    if (raw && isThemePreference(raw)) {
      return raw;
    }
  } catch {
    // ignore
  }
  return 'system';
}

export function saveThemePreference(value: ThemePreference): void {
  try {
    window.localStorage.setItem(themeStorageKey, value);
  } catch {
    // ignore
  }
}

export function resolveTheme(preference: ThemePreference): ThemeName {
  if (preference !== 'system') {
    return preference;
  }
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'default';
}

export function isThemePreference(value: string): value is ThemePreference {
  return themeOptions.some((option) => option.value === value);
}

export function loadPopupThemePreference(): PopupThemePreference {
  try {
    const raw = window.localStorage.getItem(popupThemeStorageKey);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    // ignore
  }
  return 'system';
}

export function savePopupThemePreference(value: PopupThemePreference): void {
  try {
    window.localStorage.setItem(popupThemeStorageKey, value);
  } catch {
    // ignore
  }
}

export function resolvePopupTheme(
  preference: PopupThemePreference
): 'light' | 'dark' {
  if (preference === 'light') {
    return 'light';
  }
  if (preference === 'dark') {
    return 'dark';
  }
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function getNextPopupTheme(
  preference: PopupThemePreference
): PopupThemePreference {
  const resolved = resolvePopupTheme(preference);
  if (resolved === 'dark') {
    return 'light';
  }
  return 'dark';
}
