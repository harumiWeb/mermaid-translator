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

function resolveMermaidTheme(value: unknown): Settings['mermaidTheme'] {
  if (typeof value === 'string' && isMermaidThemePreference(value)) {
    return value;
  }
  return defaultSettings.mermaidTheme;
}

function resolvePopupTheme(value: unknown): Settings['popupTheme'] {
  if (typeof value === 'string' && isPopupThemePreference(value)) {
    return value;
  }
  return defaultSettings.popupTheme;
}

const loadSettings = async (): Promise<Settings> => {
  return new Promise<Settings>((resolve) => {
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

          const mermaidTheme = resolveMermaidTheme(mermaidRaw);
          const popupTheme = resolvePopupTheme(popupRaw);
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
};

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

  useEffect(() => {
    const media =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;
    const resolvePopupTheme = () => {
      if (settings.popupTheme === 'light') {
        return 'light';
      }
      if (settings.popupTheme === 'dark') {
        return 'dark';
      }
      return media && media.matches ? 'dark' : 'light';
    };

    const applyTheme = () => {
      const theme = resolvePopupTheme();
      document.documentElement.setAttribute('data-theme', theme);
    };

    applyTheme();
    if (settings.popupTheme !== 'system' || !media) {
      return;
    }
    const handler = () => {
      applyTheme();
    };
    media.addEventListener('change', handler);
    return () => {
      media.removeEventListener('change', handler);
    };
  }, [settings.popupTheme]);

  const updateSettings = (next: Settings) => {
    setSettings(next);
    saveSettings(next);
    notifySettings(next);
  };

  return (
    <div className="app">
      <div className="header">
        <img className="logo" src="../icons/icon48.png" alt="" />
        <div className="header-text">
          {chrome?.i18n?.getMessage('extensionName') ?? 'Mermaid Translator'}
        </div>
      </div>

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

      <div className="footer">
        <a
          className="footer-link"
          href="https://github.com/harumiWeb/mermaid-translator"
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="github-icon github-icon-light"
            src="../icons/github-mark.svg"
            alt=""
          />
          <img
            className="github-icon github-icon-dark"
            src="../icons/github-mark-white.svg"
            alt=""
          />
          GitHub
        </a>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  render(<SettingsApp />, root);
}
