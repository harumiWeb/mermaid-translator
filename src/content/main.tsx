import { render } from 'preact';
import { extractMermaidCode, isMermaidLike } from '../shared/detectMermaid';
import { ActionButton } from './ui';

const isDev = import.meta.env.DEV;
const isLoggingEnabled =
  isDev || import.meta.env.VITE_ENABLE_LOGGING === 'true';

type ButtonPosition = {
  top: number;
  left: number;
};

let lastSelectionText: string | null = null;
let currentSelectionText: string | null = null;
let mountNode: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let popupRoot: HTMLElement | null = null;
let popupSelectionText: string | null = null;
let popupMessage: HTMLElement | null = null;
let popupSvg: string | null = null;
let popupActions: {
  svgButton: HTMLButtonElement;
  pngButton: HTMLButtonElement;
  openButton: HTMLButtonElement;
} | null = null;
let outsidePointerHandler: ((event: PointerEvent) => void) | null = null;
let beforeUnloadBound = false;

function resolveIconUrl(): string {
  try {
    return chrome.runtime.getURL('mermaid-icon.svg');
  } catch {
    return '';
  }
}

const iconUrl = resolveIconUrl();
const externalIconUrl = chrome.runtime.getURL('external-link-icon.svg');
const tooltipText = 'View Mermaid diagram';
const renderErrorMessage = 'Unable to render Mermaid diagram.';

function ensureMountNode(): HTMLElement | null {
  if (mountNode) {
    return mountNode;
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

function getButtonPosition(selection: Selection): ButtonPosition | null {
  const rect = getSelectionRect(selection);
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
  if (!popupActions) {
    return;
  }

  popupActions.svgButton.disabled = !enabled;
  popupActions.pngButton.disabled = !enabled;
  popupActions.openButton.disabled = !enabled;
  popupActions.svgButton.style.opacity = enabled ? '1' : '0.5';
  popupActions.pngButton.style.opacity = enabled ? '1' : '0.5';
  popupActions.openButton.style.opacity = enabled ? '1' : '0.5';
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
  popupActions = null;

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

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.title = 'Close';
  closeButton.textContent = 'x';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '6px';
  closeButton.style.right = '8px';
  closeButton.style.width = '24px';
  closeButton.style.height = '24px';
  closeButton.style.border = '1px solid #222';
  closeButton.style.borderRadius = '6px';
  closeButton.style.background = '#fff';
  closeButton.style.color = '#111';
  closeButton.style.cursor = 'pointer';
  closeButton.style.lineHeight = '20px';
  closeButton.style.padding = '0';
  closeButton.style.zIndex = '1';
  closeButton.addEventListener('click', () => {
    dismissPopup();
  });

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.paddingTop = '4px';

  const svgButton = document.createElement('button');
  svgButton.type = 'button';
  svgButton.textContent = 'SVG';
  svgButton.title = 'Save as SVG';
  svgButton.style.border = '1px solid #222';
  svgButton.style.borderRadius = '6px';
  svgButton.style.background = '#fff';
  svgButton.style.color = '#111';
  svgButton.style.cursor = 'pointer';
  svgButton.style.padding = '4px 8px';
  svgButton.disabled = true;
  svgButton.style.opacity = '0.5';
  svgButton.addEventListener('click', () => {
    if (!popupSvg) {
      setPopupMessage(renderErrorMessage);
      return;
    }

    const blob = new Blob([popupSvg], { type: 'image/svg+xml' });
    downloadBlob(blob, 'mermaid-diagram.svg');
  });

  const pngButton = document.createElement('button');
  pngButton.type = 'button';
  pngButton.textContent = 'PNG';
  pngButton.title = 'Save as PNG';
  pngButton.style.border = '1px solid #222';
  pngButton.style.borderRadius = '6px';
  pngButton.style.background = '#fff';
  pngButton.style.color = '#111';
  pngButton.style.cursor = 'pointer';
  pngButton.style.padding = '4px 8px';
  pngButton.disabled = true;
  pngButton.style.opacity = '0.5';
  pngButton.addEventListener('click', () => {
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
  });

  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.title = 'Open in new tab';
  openButton.setAttribute('aria-label', 'Open in new tab');
  openButton.style.border = '1px solid #222';
  openButton.style.borderRadius = '6px';
  openButton.style.background = '#fff';
  openButton.style.color = '#111';
  openButton.style.cursor = 'pointer';
  openButton.style.padding = '4px 6px';
  openButton.style.display = 'flex';
  openButton.style.alignItems = 'center';
  openButton.style.justifyContent = 'center';
  openButton.disabled = true;
  openButton.style.opacity = '0.5';

  const openIcon = document.createElement('img');
  openIcon.alt = '';
  openIcon.src = externalIconUrl;
  openIcon.style.width = '14px';
  openIcon.style.height = '14px';
  openButton.appendChild(openIcon);

  openButton.addEventListener('click', () => {
    setPopupMessage(null);
    if (!popupSvg) {
      setPopupMessage(renderErrorMessage);
      return;
    }

    openSvgInNewTab(popupSvg);
  });

  actions.appendChild(svgButton);
  actions.appendChild(pngButton);
  actions.appendChild(openButton);

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
  popup.appendChild(closeButton);
  popup.appendChild(actions);
  popup.appendChild(message);
  popup.appendChild(content);
  shadowRoot.appendChild(popup);

  popupRoot = popup;
  popupSelectionText = selectionText;
  popupMessage = message;
  popupSvg = null;
  popupActions = { svgButton, pngButton, openButton };
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

function handleActionClick(): void {
  if (!currentSelectionText) {
    return;
  }

  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const rect = getSelectionRect(selection);
  if (!rect) {
    return;
  }

  const popupPosition = getPopupPosition(rect);
  const content = showPopup(popupPosition, currentSelectionText);
  if (!content) {
    return;
  }

  const code = extractMermaidCode(currentSelectionText);

  void import('./mermaidRenderer').then(async ({ renderMermaid }) => {
    const svg = await renderMermaid(code, content);
    if (!svg) {
      popupSvg = null;
      setPopupMessage(renderErrorMessage);
      setActionsEnabled(false);
      return;
    }

    popupSvg = svg;
    setPopupMessage(null);
    setActionsEnabled(true);
  });
}

function handleSelectionChange(): void {
  try {
    const selection = window.getSelection();
    if (!selection) {
      currentSelectionText = null;
      renderActionButton(false, null);
      dismissPopup();
      return;
    }

    const text = selection.toString();
    if (text.trim().length === 0) {
      currentSelectionText = null;
      lastSelectionText = null;
      renderActionButton(false, null);
      dismissPopup();
      return;
    }

    currentSelectionText = text;

    const mermaidLike = isMermaidLike(text);
    if (!mermaidLike) {
      renderActionButton(false, null);
      if (popupSelectionText) {
        dismissPopup();
      }
    } else {
      const position = getButtonPosition(selection);
      if (!position) {
        renderActionButton(false, null);
      } else {
        renderActionButton(true, position);
      }
    }

    if (popupSelectionText && text !== popupSelectionText) {
      dismissPopup();
    }

    if (text !== lastSelectionText) {
      lastSelectionText = text;
      if (isLoggingEnabled) {
        console.warn('[mermaid-selection-renderer] selection updated', text);
      }
    }
  } catch {
    // fail silently (AGENTS.md 準拠)
  }
}

document.addEventListener('selectionchange', handleSelectionChange);
