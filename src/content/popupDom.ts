import type { ButtonPosition } from './selection';

export type PopupElements = {
  root: HTMLElement;
  arrow: HTMLElement;
  header: HTMLElement;
  actionsMount: HTMLElement;
  tabBar: HTMLElement;
  viewTab: HTMLButtonElement;
  editorTab: HTMLButtonElement;
  message: HTMLElement;
  loading: HTMLElement;
  content: HTMLElement;
  diagram: HTMLElement;
  editorPanel: HTMLElement;
  editorTextarea: HTMLTextAreaElement;
  resizeHandle: HTMLElement;
  zoomControls: HTMLElement;
  zoomInButton: HTMLButtonElement;
  zoomOutButton: HTMLButtonElement;
  copyButton: HTMLButtonElement;
  copyTooltip: HTMLElement;
};

type PopupDomOptions = {
  position: ButtonPosition;
  popupMinWidth: number;
  popupMaxWidth: string;
  popupDefaultMaxHeight: number;
  popupDefaultHeight: number;
  editorTextareaHeight: string;
  editorTextareaMinHeight: string;
  copyIconUrl: string;
  zoomInIconUrl: string;
  zoomOutIconUrl: string;
  onStartDrag: (event: PointerEvent) => void;
  onStartResize: (event: PointerEvent) => void;
  onStartPan: (event: PointerEvent) => void;
  onViewTab: () => void;
  onEditorTab: () => void;
  onEditorInput: (value: string) => void;
  onCopyEnter: () => void;
  onCopyLeave: () => void;
  onCopyClick: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
};

function ensureSpinnerStyles(shadowRoot: ShadowRoot): void {
  if (shadowRoot.querySelector('[data-mermaid-spinner-style]')) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-mermaid-spinner-style', 'true');
  style.textContent = `
    @keyframes mermaid-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .mermaid-spinner {
      animation: mermaid-spin 0.9s linear infinite;
    }
  `;
  shadowRoot.appendChild(style);
}

export function createPopupDom(
  shadowRoot: ShadowRoot,
  options: PopupDomOptions
): PopupElements {
  ensureSpinnerStyles(shadowRoot);

  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = `${options.position.top}px`;
  popup.style.left = `${options.position.left}px`;
  popup.style.minWidth = `${options.popupMinWidth}px`;
  popup.style.maxWidth = options.popupMaxWidth;
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

  const header = document.createElement('div');
  header.style.paddingTop = '4px';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.addEventListener('pointerdown', (event) => {
    options.onStartDrag(event);
  });

  const actions = document.createElement('div');
  actions.style.flex = '1';

  const tabBar = document.createElement('div');
  tabBar.style.display = 'none';

  const viewTab = document.createElement('button');
  viewTab.type = 'button';
  viewTab.textContent = 'View';
  viewTab.addEventListener('click', () => {
    options.onViewTab();
  });

  const editorTab = document.createElement('button');
  editorTab.type = 'button';
  editorTab.textContent = 'Editor';
  editorTab.addEventListener('click', () => {
    options.onEditorTab();
  });

  tabBar.appendChild(viewTab);
  tabBar.appendChild(editorTab);

  const message = document.createElement('div');
  message.style.marginTop = '8px';
  message.style.fontSize = '12px';
  message.style.color = '#b00020';
  message.style.display = 'none';

  const loading = document.createElement('div');
  loading.style.marginTop = '8px';
  loading.style.display = 'none';
  loading.style.alignItems = 'center';
  loading.style.gap = '8px';
  loading.style.fontSize = '12px';
  loading.style.color = '#555';

  const spinner = document.createElement('div');
  spinner.className = 'mermaid-spinner';
  spinner.style.width = '14px';
  spinner.style.height = '14px';
  spinner.style.borderRadius = '999px';
  spinner.style.border = '2px solid #c7c7c7';
  spinner.style.borderTopColor = '#555';

  const loadingText = document.createElement('span');
  loadingText.textContent = 'Rendering...';

  loading.appendChild(spinner);
  loading.appendChild(loadingText);

  const contentWrapper = document.createElement('div');
  contentWrapper.style.position = 'relative';

  const content = document.createElement('div');
  content.style.height = `${options.popupDefaultHeight}px`;
  content.style.maxHeight = `${options.popupDefaultHeight}px`;
  content.style.overflow = 'hidden';
  content.style.paddingTop = '8px';
  content.style.position = 'relative';
  content.style.cursor = 'grab';
  content.style.zIndex = '0';
  content.addEventListener('pointerdown', (event) => {
    options.onStartPan(event);
  });

  const diagram = document.createElement('div');
  diagram.style.transformOrigin = '0 0';
  diagram.style.willChange = 'transform';
  content.appendChild(diagram);

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.setAttribute('aria-label', 'Copy Mermaid code');
  copyButton.style.position = 'absolute';
  copyButton.style.top = '8px';
  copyButton.style.right = '8px';
  copyButton.style.width = '28px';
  copyButton.style.height = '28px';
  copyButton.style.borderRadius = '6px';
  copyButton.style.display = 'none';
  copyButton.style.alignItems = 'center';
  copyButton.style.justifyContent = 'center';
  copyButton.style.cursor = 'pointer';
  copyButton.style.transition = 'transform 120ms ease, background 120ms ease';
  copyButton.style.zIndex = '2';
  copyButton.setAttribute('data-pan-ignore', 'true');
  copyButton.addEventListener('mouseenter', () => {
    options.onCopyEnter();
  });
  copyButton.addEventListener('mouseleave', () => {
    options.onCopyLeave();
  });
  copyButton.addEventListener('click', () => {
    options.onCopyClick();
  });

  const copyIcon = document.createElement('img');
  copyIcon.alt = '';
  copyIcon.src = options.copyIconUrl;
  copyIcon.style.width = '14px';
  copyIcon.style.height = '14px';
  copyButton.appendChild(copyIcon);

  const copyTooltip = document.createElement('div');
  copyTooltip.style.position = 'absolute';
  copyTooltip.style.top = '8px';
  copyTooltip.style.right = '8px';
  copyTooltip.style.transform = 'translate(0, calc(-100% - 2px))';
  copyTooltip.style.opacity = '0';
  copyTooltip.style.transition = 'opacity 140ms ease, transform 140ms ease';
  copyTooltip.style.padding = '6px 8px';
  copyTooltip.style.borderRadius = '6px';
  copyTooltip.style.background = '#111';
  copyTooltip.style.color = '#fff';
  copyTooltip.style.fontSize = '12px';
  copyTooltip.style.lineHeight = '16px';
  copyTooltip.style.whiteSpace = 'nowrap';
  copyTooltip.style.pointerEvents = 'none';
  copyTooltip.style.zIndex = '3';
  copyTooltip.setAttribute('data-pan-ignore', 'true');
  copyTooltip.textContent = 'Copy Mermaid code';

  const zoomControls = document.createElement('div');
  zoomControls.style.position = 'absolute';
  zoomControls.style.right = '8px';
  zoomControls.style.bottom = '8px';
  zoomControls.style.display = 'flex';
  zoomControls.style.gap = '6px';
  zoomControls.style.zIndex = '2';
  zoomControls.setAttribute('data-zoom-control', 'true');

  const zoomOutButton = document.createElement('button');
  zoomOutButton.type = 'button';
  zoomOutButton.setAttribute('aria-label', 'Zoom out');
  zoomOutButton.setAttribute('data-zoom-control', 'true');
  zoomOutButton.addEventListener('click', () => {
    options.onZoomOut();
  });

  const zoomOutIcon = document.createElement('img');
  zoomOutIcon.alt = '';
  zoomOutIcon.src = options.zoomOutIconUrl;
  zoomOutIcon.style.width = '14px';
  zoomOutIcon.style.height = '14px';
  zoomOutButton.appendChild(zoomOutIcon);

  const zoomInButton = document.createElement('button');
  zoomInButton.type = 'button';
  zoomInButton.setAttribute('aria-label', 'Zoom in');
  zoomInButton.setAttribute('data-zoom-control', 'true');
  zoomInButton.addEventListener('click', () => {
    options.onZoomIn();
  });

  const zoomInIcon = document.createElement('img');
  zoomInIcon.alt = '';
  zoomInIcon.src = options.zoomInIconUrl;
  zoomInIcon.style.width = '14px';
  zoomInIcon.style.height = '14px';
  zoomInButton.appendChild(zoomInIcon);

  zoomControls.appendChild(zoomOutButton);
  zoomControls.appendChild(zoomInButton);
  content.appendChild(zoomControls);

  const editorPanel = document.createElement('div');
  editorPanel.style.display = 'none';
  editorPanel.style.paddingTop = '8px';

  const editorTextarea = document.createElement('textarea');
  editorTextarea.style.width = '100%';
  editorTextarea.style.minHeight = options.editorTextareaMinHeight;
  editorTextarea.style.height = options.editorTextareaHeight;
  editorTextarea.style.resize = 'vertical';
  editorTextarea.style.fontFamily = 'monospace';
  editorTextarea.style.fontSize = '12px';
  editorTextarea.style.lineHeight = '1.4';
  editorTextarea.style.padding = '8px';
  editorTextarea.style.boxSizing = 'border-box';
  editorTextarea.addEventListener('input', () => {
    options.onEditorInput(editorTextarea.value);
  });

  editorPanel.appendChild(editorTextarea);

  contentWrapper.appendChild(copyButton);
  contentWrapper.appendChild(copyTooltip);
  contentWrapper.appendChild(content);
  contentWrapper.appendChild(editorPanel);

  popup.appendChild(arrow);
  header.appendChild(actions);
  popup.appendChild(header);
  popup.appendChild(tabBar);
  popup.appendChild(message);
  popup.appendChild(loading);
  popup.appendChild(contentWrapper);

  const resizeHandle = document.createElement('div');
  resizeHandle.style.position = 'absolute';
  resizeHandle.style.width = '14px';
  resizeHandle.style.height = '14px';
  resizeHandle.style.right = '6px';
  resizeHandle.style.bottom = '6px';
  resizeHandle.style.cursor = 'nwse-resize';
  resizeHandle.style.display = 'none';
  resizeHandle.addEventListener('pointerdown', (event) => {
    options.onStartResize(event);
  });
  popup.appendChild(resizeHandle);

  shadowRoot.appendChild(popup);

  return {
    root: popup,
    arrow,
    header,
    actionsMount: actions,
    tabBar,
    viewTab,
    editorTab,
    message,
    loading,
    content,
    diagram,
    editorPanel,
    editorTextarea,
    resizeHandle,
    zoomControls,
    zoomInButton,
    zoomOutButton,
    copyButton,
    copyTooltip,
  };
}

export function destroyPopupDom(elements: PopupElements): void {
  elements.root.remove();
}

export function applyPopupTheme(
  elements: PopupElements,
  theme: 'light' | 'dark'
): void {
  const spinner = elements.loading.querySelector(
    '.mermaid-spinner'
  ) as HTMLElement | null;

  if (theme === 'dark') {
    elements.root.style.background = '#1c1c1c';
    elements.root.style.color = '#f2f2f2';
    elements.root.style.border = '1px solid #3a3a3a';
    elements.root.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
    elements.arrow.style.background = '#1c1c1c';
    elements.arrow.style.borderLeft = '1px solid #3a3a3a';
    elements.arrow.style.borderTop = '1px solid #3a3a3a';
    elements.loading.style.color = '#cfcfcf';
    if (spinner) {
      spinner.style.border = '2px solid #555';
      spinner.style.borderTopColor = '#cfcfcf';
    }
  } else {
    elements.root.style.background = '#fff';
    elements.root.style.color = '#111';
    elements.root.style.border = '1px solid #222';
    elements.root.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    elements.arrow.style.background = '#fff';
    elements.arrow.style.borderLeft = '1px solid #222';
    elements.arrow.style.borderTop = '1px solid #222';
    elements.loading.style.color = '#555';
    if (spinner) {
      spinner.style.border = '2px solid #c7c7c7';
      spinner.style.borderTopColor = '#555';
    }
  }
}

export function clampPopupToViewport(elements: PopupElements): void {
  const popupRect = elements.root.getBoundingClientRect();
  const maxTop = window.innerHeight - popupRect.height - 4;
  const maxLeft = window.innerWidth - popupRect.width - 4;
  const clampedTop = Math.max(4, Math.min(popupRect.top, maxTop));
  const clampedLeft = Math.max(4, Math.min(popupRect.left, maxLeft));

  if (clampedTop !== popupRect.top) {
    elements.root.style.top = `${Math.floor(clampedTop)}px`;
  }
  if (clampedLeft !== popupRect.left) {
    elements.root.style.left = `${Math.floor(clampedLeft)}px`;
  }
}
