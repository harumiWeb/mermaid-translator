import {
  isMermaidThemePreference,
  mermaidThemeOptions,
  type MermaidThemeName,
  type MermaidThemePreference,
  type PopupThemePreference,
} from '../shared/themeOptions';

export const themeOptions = mermaidThemeOptions;

export type ThemePreference = MermaidThemePreference;
export type ThemeName = MermaidThemeName;

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
  return isMermaidThemePreference(value);
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
