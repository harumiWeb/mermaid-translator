import type {
  MermaidThemePreference,
  PopupThemePreference,
} from './themeOptions';

export const settingsStorageKeys = {
  mermaidTheme: 'mermaid-translator:mermaid-theme',
  popupTheme: 'mermaid-translator:popup-theme',
  openInEditMode: 'mermaid-translator:open-in-edit-mode',
} as const;

export type Settings = {
  mermaidTheme: MermaidThemePreference;
  popupTheme: PopupThemePreference;
  openInEditMode: boolean;
};
