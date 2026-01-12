import './style.css';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { settingsStorageKeys, type Settings } from '../shared/settings';
import {
  isMermaidThemePreference,
  isPopupThemePreference,
  mermaidThemeOptions,
  popupThemeOptions,
} from '../shared/themeOptions';

const defaultSettings: Settings = {
  mermaidTheme: 'system',
  popupTheme: 'system',
  openInEditMode: false,
};

function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    try {
      if (!chrome?.storage?.local) {
        resolve(defaultSettings);
        return;
      }
      chrome.storage.local.get(
        [
          settingsStorageKeys.mermaidTheme,
          settingsStorageKeys.popupTheme,
          settingsStorageKeys.openInEditMode,
        ],
        (raw) => {
          const mermaidRaw = raw[settingsStorageKeys.mermaidTheme];
          const popupRaw = raw[settingsStorageKeys.popupTheme];
          const editRaw = raw[settingsStorageKeys.openInEditMode];

          const mermaidTheme = isMermaidThemePreference(String(mermaidRaw))
            ? String(mermaidRaw)
            : defaultSettings.mermaidTheme;
          const popupTheme = isPopupThemePreference(String(popupRaw))
            ? String(popupRaw)
            : defaultSettings.popupTheme;
          const openInEditMode =
            typeof editRaw === 'boolean'
              ? editRaw
              : defaultSettings.openInEditMode;

          resolve({
            mermaidTheme,
            popupTheme,
            openInEditMode,
          });
        }
      );
    } catch {
      resolve(defaultSettings);
    }
  });
}

function saveSettings(settings: Settings): void {
  try {
    if (!chrome?.storage?.local) {
      return;
    }
    chrome.storage.local.set({
      [settingsStorageKeys.mermaidTheme]: settings.mermaidTheme,
      [settingsStorageKeys.popupTheme]: settings.popupTheme,
      [settingsStorageKeys.openInEditMode]: settings.openInEditMode,
    });
  } catch {
    // ignore
  }
}

function notifySettings(settings: Settings): void {
  try {
    if (!chrome?.runtime?.sendMessage) {
      return;
    }
    chrome.runtime.sendMessage(
      {
        type: 'settings:update',
        payload: settings,
      },
      () => {
        void chrome.runtime.lastError;
      }
    );
  } catch {
    // ignore
  }
}

function SettingsApp() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadSettings().then((next) => {
      setSettings(next);
      setLoaded(true);
    });
  }, []);

  const updateSettings = (next: Settings) => {
    setSettings(next);
    saveSettings(next);
    notifySettings(next);
  };

  return (
    <div className="app">
      <div className="title">Settings</div>

      <div className="field">
        <label className="label" htmlFor="popup-theme">
          UI theme
        </label>
        <select
          id="popup-theme"
          disabled={!loaded}
          value={settings.popupTheme}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (!isPopupThemePreference(value)) {
              return;
            }
            updateSettings({
              ...settings,
              popupTheme: value,
            });
          }}
        >
          {popupThemeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="mermaid-theme">
          Mermaid theme
        </label>
        <select
          id="mermaid-theme"
          disabled={!loaded}
          value={settings.mermaidTheme}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (!isMermaidThemePreference(value)) {
              return;
            }
            updateSettings({
              ...settings,
              mermaidTheme: value,
            });
          }}
        >
          {mermaidThemeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="open-edit">
          Default behavior
        </label>
        <div className="checkbox-row">
          <input
            id="open-edit"
            type="checkbox"
            checked={settings.openInEditMode}
            disabled={!loaded}
            onChange={(event) => {
              updateSettings({
                ...settings,
                openInEditMode: event.currentTarget.checked,
              });
            }}
          />
          <span>Open in edit mode by default</span>
        </div>
        <div className="hint">Applied when opening a new popup.</div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  render(<SettingsApp />, root);
}
