import { render } from 'preact';
import { extractMermaidCode, isMermaidLike } from '../shared/detectMermaid';
import { ActionButton, PopupActions } from './ui';

const isDev = import.meta.env.DEV;
const isLoggingEnabled =
  isDev || import.meta.env.VITE_ENABLE_LOGGING === 'true';

const kaTeXWarningSnippet = "KaTeX doesn't work in quirks mode.";

function suppressKaTeXQuirksWarning(): void {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const hasKaTeXWarning = args.some(
      (arg) => typeof arg === 'string' && arg.includes(kaTeXWarningSnippet)
    );
    if (hasKaTeXWarning) {
      return;
    }
    originalWarn(...args);
  };
}

suppressKaTeXQuirksWarning();

type ButtonPosition = {
  top: number;
  left: number;
};

let lastSelectionText: string | null = null;
let mountNode: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let popupRoot: HTMLElement | null = null;
let popupSelectionText: string | null = null;
let popupMessage: HTMLElement | null = null;
let popupSvg: string | null = null;
let popupActionsMount: HTMLElement | null = null;
let popupActionsState = {
  svgEnabled: false,
  pngEnabled: false,
  openEnabled: false,
};
let popupContent: HTMLElement | null = null;
let themePreference: ThemePreference | null = null;
let outsidePointerHandler: ((event: PointerEvent) => void) | null = null;
let beforeUnloadBound = false;

function resolveIconUrl(): string {
  try {
    return chrome.runtime.getURL('icons/mermaid-icon.svg');
  } catch {
    return '';
  }
}

const iconUrl = resolveIconUrl();
const externalIconUrl = chrome.runtime.getURL('icons/external-link-icon.svg');
const closeIconUrl = chrome.runtime.getURL('icons/close.svg');
const paletteIconUrl = chrome.runtime.getURL('icons/palette.svg');
const tooltipText = 'View Mermaid diagram';
const renderErrorMessage = 'Unable to render Mermaid diagram.';
const themeStorageKey = 'mermaid-selection-renderer:theme';
const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'forest', label: 'Forest' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'base', label: 'Base' },
] as const;

type ThemePreference = (typeof themeOptions)[number]['value'];
type ThemeName = Exclude<ThemePreference, 'system'>;

function ensureMountNode(): HTMLElement | null {
  if (mountNode) {
    return mountNode;
  }

  if (!themePreference) {
    themePreference = loadThemePreference();
  }

  const host = document.createElement('div');
  host.setAttribute('data-mermaid-selection-renderer', 'root');
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '0';
  host.style.height = '0';
  host.style.zIndex = '2147483647';

  const shadow = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadow.appendChild(container);

  const parent = document.body ?? document.documentElement;
  if (!parent) {
    return null;
  }

  parent.appendChild(host);
  shadowRoot = shadow;
  mountNode = container;

  if (!beforeUnloadBound) {
    window.addEventListener('beforeunload', dismissPopup);
    beforeUnloadBound = true;
  }

  return mountNode;
}

function getSelectionRect(selection: Selection): DOMRect | null {
  if (selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rects = range.getClientRects();
  const rect =
    rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();

  if (!rect || (rect.width === 0 && rect.height === 0)) {
    return null;
  }

  return rect;
}

function getButtonPosition(rect: DOMRect | null): ButtonPosition | null {
  if (!rect) {
    return null;
  }

  const offset = 8;
  const buttonSize = 28;
  let top = rect.top - buttonSize - offset;
  let left = rect.right + offset;

  if (top < 4) {
    top = rect.bottom + offset;
  }

  const maxLeft = Math.max(4, window.innerWidth - buttonSize - 4);
  const maxTop = Math.max(4, window.innerHeight - buttonSize - 4);

  left = Math.min(Math.max(4, left), maxLeft);
  top = Math.min(Math.max(4, top), maxTop);

  return {
    top: Math.round(top),
    left: Math.round(left),
  };
}

const textMeasureCanvas = document.createElement('canvas');
const textMeasureContext = textMeasureCanvas.getContext('2d');

function parsePixel(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function resolveLineHeight(style: CSSStyleDeclaration): number {
  const lineHeight = Number.parseFloat(style.lineHeight);
  if (!Number.isNaN(lineHeight)) {
    return lineHeight;
  }

  const fontSize = Number.parseFloat(style.fontSize);
  if (!Number.isNaN(fontSize)) {
    return fontSize * 1.2;
  }

  return 16;
}

function getFontShorthand(style: CSSStyleDeclaration): string {
  return `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`;
}

function measureTextWidth(text: string, style: CSSStyleDeclaration): number {
  if (!textMeasureContext) {
    return 0;
  }

  textMeasureContext.font = getFontShorthand(style);
  return textMeasureContext.measureText(text).width;
}

function isTextInput(element: HTMLInputElement): boolean {
  const type = element.type.toLowerCase();
  return (
    type === 'text' ||
    type === 'search' ||
    type === 'url' ||
    type === 'email' ||
    type === 'tel' ||
    type === ''
  );
}

function getInputSelectionText(
  element: HTMLTextAreaElement | HTMLInputElement
): string | null {
  const start = element.selectionStart;
  const end = element.selectionEnd;
  if (start === null || end === null || start === end) {
    return null;
  }

  return element.value.slice(start, end);
}

function getInputSelectionRect(
  element: HTMLTextAreaElement | HTMLInputElement
): DOMRect | null {
  const selectionEnd = element.selectionEnd;
  if (selectionEnd === null) {
    return null;
  }

  const valueBefore = element.value.slice(0, selectionEnd);
  const lines = valueBefore.split(/\r?\n/);
  const lineIndex = Math.max(0, lines.length - 1);
  const lineText = lines[lineIndex] ?? '';

  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const lineHeight = resolveLineHeight(style);
  const paddingLeft = parsePixel(style.paddingLeft);
  const paddingTop = parsePixel(style.paddingTop);
  const borderLeft = parsePixel(style.borderLeftWidth);
  const borderTop = parsePixel(style.borderTopWidth);
  const textWidth = measureTextWidth(lineText, style);

  const left =
    rect.left + borderLeft + paddingLeft + textWidth - element.scrollLeft;
  const top =
    rect.top +
    borderTop +
    paddingTop +
    lineIndex * lineHeight -
    element.scrollTop;

  return new DOMRect(left, top, 1, lineHeight);
}

function getSelectionInfo(): {
  text: string;
  rect: DOMRect | null;
} | null {
  const active = document.activeElement;
  if (active instanceof HTMLTextAreaElement) {
    const text = getInputSelectionText(active);
    if (text && text.trim().length > 0) {
      return { text, rect: getInputSelectionRect(active) };
    }
  }

  if (active instanceof HTMLInputElement && isTextInput(active)) {
    const text = getInputSelectionText(active);
    if (text && text.trim().length > 0) {
      return { text, rect: getInputSelectionRect(active) };
    }
  }

  const selection = window.getSelection();
  if (!selection) {
    return null;
  }

  const text = selection.toString();
  if (text.trim().length === 0) {
    return null;
  }

  return { text, rect: getSelectionRect(selection) };
}

function getPopupPosition(rect: DOMRect): ButtonPosition {
  const offset = 8;
  const minWidth = 550;
  const maxWidth = Math.floor(window.innerWidth * 0.5);
  let top = rect.bottom + offset;
  let left = rect.left;

  const constrainedWidth = Math.max(minWidth, maxWidth);
  const maxLeft = Math.max(4, window.innerWidth - constrainedWidth - 4);
  const maxTop = Math.max(4, window.innerHeight - 200 - 4);

  left = Math.min(Math.max(4, left), maxLeft);
  top = Math.min(Math.max(4, top), maxTop);

  return {
    top: Math.round(top),
    left: Math.round(left),
  };
}

function renderActionButton(
  visible: boolean,
  position: ButtonPosition | null
): void {
  if (!mountNode && !visible) {
    return;
  }

  const node = ensureMountNode();
  if (!node) {
    return;
  }

  const fallbackPosition = position ?? { top: 0, left: 0 };

  render(
    <ActionButton
      visible={visible}
      top={fallbackPosition.top}
      left={fallbackPosition.left}
      iconUrl={iconUrl}
      tooltipText={tooltipText}
      onClick={handleActionClick}
    />,
    node
  );
}

function setPopupMessage(message: string | null): void {
  if (!popupMessage) {
    return;
  }

  popupMessage.textContent = message ?? '';
  popupMessage.style.display = message ? 'block' : 'none';
}

function setActionsEnabled(enabled: boolean): void {
  if (!popupActionsMount) {
    return;
  }

  popupActionsState = {
    svgEnabled: enabled,
    pngEnabled: enabled,
    openEnabled: enabled,
  };
  renderPopupActions();
}

function loadThemePreference(): ThemePreference {
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

function saveThemePreference(value: ThemePreference): void {
  try {
    window.localStorage.setItem(themeStorageKey, value);
  } catch {
    // ignore
  }
}

function resolveTheme(preference: ThemePreference): ThemeName {
  if (preference !== 'system') {
    return preference;
  }
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'default';
}

function isThemePreference(value: string): value is ThemePreference {
  return themeOptions.some((option) => option.value === value);
}

function rerenderPopup(theme: ThemeName): void {
  if (!popupSelectionText || !popupContent) {
    return;
  }

  const code = extractMermaidCode(popupSelectionText);
  setPopupMessage(null);
  setActionsEnabled(false);

  void import('./mermaidRenderer').then(async ({ renderMermaid }) => {
    const svg = await renderMermaid(code, popupContent, theme);
    if (!svg) {
      popupSvg = null;
      setPopupMessage(renderErrorMessage);
      setActionsEnabled(false);
      return;
    }

    popupSvg = svg;
    setPopupMessage(null);
    setActionsEnabled(true);
    if (popupRoot) {
      clampPopupToViewport(popupRoot);
    }
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function openSvgInNewTab(svgText: string): void {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mermaid Diagram</title>
    <style>
      html, body { margin: 0; padding: 0; background: #fff; }
      svg { display: block; max-width: 100%; height: auto; }
    </style>
  </head>
  <body>${svgText}</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

function normalizeSvg(svgText: string): {
  svg: string;
  width: number;
  height: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.documentElement;
  const widthAttr = svg.getAttribute('width');
  const heightAttr = svg.getAttribute('height');
  const viewBox = svg.getAttribute('viewBox');

  const width = widthAttr ? Number.parseFloat(widthAttr) : NaN;
  const height = heightAttr ? Number.parseFloat(heightAttr) : NaN;

  let resolvedWidth = width;
  let resolvedHeight = height;

  if (Number.isNaN(resolvedWidth) || Number.isNaN(resolvedHeight)) {
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map((part) => Number.parseFloat(part));
      if (parts.length === 4 && parts.every((value) => !Number.isNaN(value))) {
        resolvedWidth = parts[2];
        resolvedHeight = parts[3];
      }
    }
  }

  if (Number.isNaN(resolvedWidth) || Number.isNaN(resolvedHeight)) {
    resolvedWidth = 800;
    resolvedHeight = 600;
  }

  svg.setAttribute('width', String(resolvedWidth));
  svg.setAttribute('height', String(resolvedHeight));
  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const serialized = new XMLSerializer().serializeToString(svg);
  return { svg: serialized, width: resolvedWidth, height: resolvedHeight };
}

async function exportPng(svgText: string): Promise<Blob | null> {
  try {
    const normalized = normalizeSvg(svgText);
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      normalized.svg
    )}`;
    const image = new Image();

    const loadPromise = new Promise<void>((resolve, reject) => {
      image.onload = () => {
        resolve();
      };
      image.onerror = () => {
        reject(new Error('image load failed'));
      };
    });

    image.src = svgUrl;
    await loadPromise;

    const canvas = document.createElement('canvas');
    canvas.width = normalized.width;
    canvas.height = normalized.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(svgUrl);
      return null;
    }

    ctx.drawImage(image, 0, 0, normalized.width, normalized.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((value) => {
        resolve(value);
      }, 'image/png');
    });
    return blob;
  } catch {
    return null;
  }
}

function dismissPopup(): void {
  if (!popupRoot) {
    return;
  }

  popupRoot.remove();
  popupRoot = null;
  popupSelectionText = null;
  popupMessage = null;
  popupSvg = null;
  popupActionsMount = null;
  popupActionsState = {
    svgEnabled: false,
    pngEnabled: false,
    openEnabled: false,
  };
  popupContent = null;

  if (outsidePointerHandler) {
    document.removeEventListener('pointerdown', outsidePointerHandler, true);
    outsidePointerHandler = null;
  }
}

function showPopup(
  position: ButtonPosition,
  selectionText: string
): HTMLElement | null {
  const node = ensureMountNode();
  if (!node || !shadowRoot) {
    return null;
  }

  dismissPopup();

  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = `${position.top}px`;
  popup.style.left = `${position.left}px`;
  popup.style.minWidth = '550px';
  popup.style.maxWidth = '50vw';
  popup.style.background = '#fff';
  popup.style.color = '#111';
  popup.style.border = '1px solid #222';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
  popup.style.padding = '12px 12px 10px';
  popup.style.zIndex = '2147483647';

  const arrow = document.createElement('span');
  arrow.style.position = 'absolute';
  arrow.style.top = '-6px';
  arrow.style.left = '16px';
  arrow.style.width = '10px';
  arrow.style.height = '10px';
  arrow.style.background = '#fff';
  arrow.style.borderLeft = '1px solid #222';
  arrow.style.borderTop = '1px solid #222';
  arrow.style.transform = 'rotate(45deg)';

  applyPopupTheme(popup, arrow);

  const actions = document.createElement('div');
  actions.style.paddingTop = '4px';

  const message = document.createElement('div');
  message.style.marginTop = '8px';
  message.style.fontSize = '12px';
  message.style.color = '#b00020';
  message.style.display = 'none';

  const content = document.createElement('div');
  content.style.maxHeight = '320px';
  content.style.overflow = 'auto';
  content.style.paddingTop = '8px';

  popup.appendChild(arrow);
  popup.appendChild(actions);
  popup.appendChild(message);
  popup.appendChild(content);
  shadowRoot.appendChild(popup);

  clampPopupToViewport(popup);

  popupRoot = popup;
  popupSelectionText = selectionText;
  popupMessage = message;
  popupSvg = null;
  popupActionsMount = actions;
  popupContent = content;
  popupActionsState = {
    svgEnabled: false,
    pngEnabled: false,
    openEnabled: false,
  };
  renderPopupActions();
  setActionsEnabled(false);

  outsidePointerHandler = (event: PointerEvent) => {
    if (!popupRoot) {
      return;
    }

    const path =
      typeof event.composedPath === 'function' ? event.composedPath() : [];
    if (path.includes(popupRoot)) {
      return;
    }

    dismissPopup();
  };

  document.addEventListener('pointerdown', outsidePointerHandler, true);

  return content;
}

function renderPopupActions(): void {
  if (!popupActionsMount) {
    return;
  }

  const currentThemePreference = themePreference ?? 'system';

  render(
    <PopupActions
      svgEnabled={popupActionsState.svgEnabled}
      pngEnabled={popupActionsState.pngEnabled}
      openEnabled={popupActionsState.openEnabled}
      themeOptions={themeOptions}
      themeValue={currentThemePreference}
      openIconUrl={externalIconUrl}
      closeIconUrl={closeIconUrl}
      paletteIconUrl={paletteIconUrl}
      onSvg={() => {
        if (!popupSvg) {
          setPopupMessage(renderErrorMessage);
          return;
        }

        const blob = new Blob([popupSvg], { type: 'image/svg+xml' });
        downloadBlob(blob, 'mermaid-diagram.svg');
      }}
      onPng={() => {
        void (async () => {
          if (!popupSvg) {
            setPopupMessage(renderErrorMessage);
            return;
          }

          const blob = await exportPng(popupSvg);
          if (!blob) {
            setPopupMessage(renderErrorMessage);
            return;
          }

          downloadBlob(blob, 'mermaid-diagram.png');
        })();
      }}
      onOpen={() => {
        setPopupMessage(null);
        if (!popupSvg) {
          setPopupMessage(renderErrorMessage);
          return;
        }

        openSvgInNewTab(popupSvg);
      }}
      onThemeChange={(value) => {
        if (!isThemePreference(value)) {
          return;
        }
        themePreference = value;
        saveThemePreference(value);
        renderPopupActions();
        rerenderPopup(resolveTheme(value));
      }}
      onClose={() => {
        dismissPopup();
      }}
    />,
    popupActionsMount
  );
}

function applyPopupTheme(popup: HTMLElement, arrow: HTMLElement): void {
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (prefersDark) {
    popup.style.background = '#1c1c1c';
    popup.style.color = '#f2f2f2';
    popup.style.border = '1px solid #3a3a3a';
    popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
    arrow.style.background = '#1c1c1c';
    arrow.style.borderLeft = '1px solid #3a3a3a';
    arrow.style.borderTop = '1px solid #3a3a3a';
  } else {
    popup.style.background = '#fff';
    popup.style.color = '#111';
    popup.style.border = '1px solid #222';
    popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    arrow.style.background = '#fff';
    arrow.style.borderLeft = '1px solid #222';
    arrow.style.borderTop = '1px solid #222';
  }
}

function clampPopupToViewport(popup: HTMLElement): void {
  const popupRect = popup.getBoundingClientRect();
  const maxTop = window.innerHeight - popupRect.height - 4;
  const maxLeft = window.innerWidth - popupRect.width - 4;
  const clampedTop = Math.max(4, Math.min(popupRect.top, maxTop));
  const clampedLeft = Math.max(4, Math.min(popupRect.left, maxLeft));

  if (clampedTop !== popupRect.top) {
    popup.style.top = `${Math.floor(clampedTop)}px`;
  }
  if (clampedLeft !== popupRect.left) {
    popup.style.left = `${Math.floor(clampedLeft)}px`;
  }
}

function handleActionClick(): void {
  const selectionInfo = getSelectionInfo();
  if (!selectionInfo) {
    return;
  }

  if (!selectionInfo.rect) {
    return;
  }

  const popupPosition = getPopupPosition(selectionInfo.rect);
  const content = showPopup(popupPosition, selectionInfo.text);
  if (!content) {
    return;
  }

  const code = extractMermaidCode(selectionInfo.text);
  const theme = resolveTheme(themePreference ?? 'system');

  void import('./mermaidRenderer').then(async ({ renderMermaid }) => {
    const svg = await renderMermaid(code, content, theme);
    if (!svg) {
      popupSvg = null;
      setPopupMessage(renderErrorMessage);
      setActionsEnabled(false);
      if (popupRoot) {
        clampPopupToViewport(popupRoot);
      }
      return;
    }

    popupSvg = svg;
    setPopupMessage(null);
    setActionsEnabled(true);
    if (popupRoot) {
      clampPopupToViewport(popupRoot);
    }
  });
}

function handleSelectionChange(): void {
  try {
    const selectionInfo = getSelectionInfo();
    if (!selectionInfo) {
      renderActionButton(false, null);
      dismissPopup();
      return;
    }

    const mermaidLike = isMermaidLike(selectionInfo.text);
    if (!mermaidLike) {
      renderActionButton(false, null);
      if (popupSelectionText) {
        dismissPopup();
      }
    } else {
      const position = getButtonPosition(selectionInfo.rect);
      if (!position) {
        renderActionButton(false, null);
      } else {
        renderActionButton(true, position);
      }
    }

    if (popupSelectionText && selectionInfo.text !== popupSelectionText) {
      dismissPopup();
    }

    if (selectionInfo.text !== lastSelectionText) {
      lastSelectionText = selectionInfo.text;
      if (isLoggingEnabled) {
        console.warn(
          '[mermaid-selection-renderer] selection updated',
          selectionInfo.text
        );
      }
    }
  } catch {
    // fail silently (AGENTS.md 準拠)
  }
}

document.addEventListener('selectionchange', handleSelectionChange);
