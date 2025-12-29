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
let renderNode: HTMLElement | null = null;

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
  const renderContainer = document.createElement('div');
  renderContainer.style.display = 'none';
  shadow.appendChild(container);
  shadow.appendChild(renderContainer);

  const parent = document.body ?? document.documentElement;
  if (!parent) {
    return null;
  }

  parent.appendChild(host);
  mountNode = container;
  renderNode = renderContainer;
  return mountNode;
}

function getButtonPosition(selection: Selection): ButtonPosition | null {
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

function handleActionClick(): void {
  if (!currentSelectionText) {
    return;
  }

  const node = ensureMountNode();
  if (!node || !renderNode) {
    return;
  }

  void import('./mermaidRenderer').then(({ renderMermaid }) => {
    void renderMermaid(currentSelectionText, renderNode);
  });
}

function handleSelectionChange(): void {
  try {
    const selection = window.getSelection();
    if (!selection) {
      currentSelectionText = null;
      renderActionButton(false, null);
      return;
    }

    const text = selection.toString();
    if (text.trim().length === 0) {
      currentSelectionText = null;
      lastSelectionText = null;
      renderActionButton(false, null);
      return;
    }

    currentSelectionText = text;

    const mermaidLike = isMermaidLike(text);
    if (!mermaidLike) {
      renderActionButton(false, null);
    } else {
      const position = getButtonPosition(selection);
      if (!position) {
        renderActionButton(false, null);
      } else {
        renderActionButton(true, position);
      }
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
