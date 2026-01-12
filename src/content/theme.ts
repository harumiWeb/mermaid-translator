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

/**
 * Load Mermaid theme preference from localStorage.
 *
 * @returns Stored preference or 'system' when unavailable.
 */
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

/**
 * Persist Mermaid theme preference to localStorage.
 *
 * @param value - Theme preference to store.
 */
export function saveThemePreference(value: ThemePreference): void {
  try {
    window.localStorage.setItem(themeStorageKey, value);
  } catch {
    // ignore
  }
}

/**
 * Resolve a Mermaid theme, honoring system preference when set to system.
 *
 * @param preference - Theme preference to resolve.
 * @returns Concrete Mermaid theme name.
 */
export function resolveTheme(preference: ThemePreference): ThemeName {
  if (preference !== 'system') {
    return preference;
  }
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'default';
}

/**
 * Type guard for supported Mermaid theme preferences.
 *
 * @param value - Raw preference value to check.
 * @returns True when the value is a supported preference.
 */
export function isThemePreference(value: string): value is ThemePreference {
  return isMermaidThemePreference(value);
}

/**
 * Load popup theme preference from localStorage.
 *
 * @returns Stored preference or 'system' when unavailable.
 */
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

/**
 * Persist popup theme preference to localStorage.
 *
 * @param value - Popup theme preference to store.
 */
export function savePopupThemePreference(value: PopupThemePreference): void {
  try {
    window.localStorage.setItem(popupThemeStorageKey, value);
  } catch {
    // ignore
  }
}

/**
 * Resolve popup theme, honoring system preference when set to system.
 *
 * @param preference - Popup theme preference to resolve.
 * @returns Resolved popup theme.
 */
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

/**
 * Cycle between light and dark popup themes based on the current preference.
 *
 * @param preference - Current popup theme preference.
 * @returns Next popup theme preference.
 */
export function getNextPopupTheme(
  preference: PopupThemePreference
): PopupThemePreference {
  const resolved = resolvePopupTheme(preference);
  if (resolved === 'dark') {
    return 'light';
  }
  return 'dark';
}
