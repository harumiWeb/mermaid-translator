type ChromeStorageChange = {
  oldValue?: unknown;
  newValue?: unknown;
};

interface ChromeStorageArea {
  get: (
    keys: string[],
    callback: (items: Record<string, unknown>) => void
  ) => void;
  set: (items: Record<string, unknown>) => void;
}

interface ChromeStorage {
  local: ChromeStorageArea;
  onChanged: {
    addListener: (
      callback: (
        changes: Record<string, ChromeStorageChange>,
        areaName: 'local' | 'sync' | 'managed' | 'session'
      ) => void
    ) => void;
  };
}

interface ChromeRuntime {
  getURL: (path: string) => string;
  sendMessage: (message: unknown, callback?: () => void) => void;
  onMessage: {
    addListener: (callback: (message: unknown) => void) => void;
  };
  lastError?: unknown;
}

interface ChromeI18n {
  getMessage: (key: string) => string;
}

interface ChromeApi {
  runtime: ChromeRuntime;
  storage: ChromeStorage;
  i18n: ChromeI18n;
}

declare const chrome: ChromeApi;
