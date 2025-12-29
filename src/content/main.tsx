import { render } from 'preact';
import { isMermaidLike } from '../shared/detectMermaid';
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
const tooltipText = 'View Mermaid diagram';

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

function dismissPopup(): void {
  if (!popupRoot) {
    return;
  }

  popupRoot.remove();
  popupRoot = null;
  popupSelectionText = null;

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
  closeButton.textContent = '×';
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

  const content = document.createElement('div');
  content.style.maxHeight = '320px';
  content.style.overflow = 'auto';
  content.style.paddingTop = '8px';

  popup.appendChild(arrow);
  popup.appendChild(closeButton);
  popup.appendChild(content);
  shadowRoot.appendChild(popup);

  popupRoot = popup;
  popupSelectionText = selectionText;

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

  void import('./mermaidRenderer').then(({ renderMermaid }) => {
    void renderMermaid(currentSelectionText, content);
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
