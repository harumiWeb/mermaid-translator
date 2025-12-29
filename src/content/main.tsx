const isDev = import.meta.env.DEV;
const isLoggingEnabled =
  isDev || import.meta.env.VITE_ENABLE_LOGGING === 'true';

let lastSelectionText: string | null = null;

function handleSelectionChange(): void {
  try {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const text = selection.toString();
    if (text.trim().length === 0) {
      return;
    }

    if (text === lastSelectionText) {
      return;
    }

    lastSelectionText = text;

    if (isLoggingEnabled) {
      console.warn('[mermaid-selection-renderer] selection updated', text);
    }
  } catch {
    // fail silently (AGENTS.md 準拠)
  }
}

document.addEventListener('selectionchange', handleSelectionChange);
