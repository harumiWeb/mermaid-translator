interface ChromeRuntime {
  getURL: (path: string) => string;
}

interface ChromeApi {
  runtime: ChromeRuntime;
}

declare const chrome: ChromeApi;
