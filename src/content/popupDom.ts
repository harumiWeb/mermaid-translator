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
  splitButton: HTMLButtonElement;
  splitTooltip: HTMLElement;
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
  splitIconUrl: string;
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
  onSplitEnter: () => void;
  onSplitLeave: () => void;
  onSplitClick: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
};

export function createPopupDom(
  shadowRoot: ShadowRoot,
  options: PopupDomOptions
): PopupElements {
  const popup = document.createElement('div');
  popup.className = 'mr-popup mr-theme';
  popup.style.top = `${options.position.top}px`;
  popup.style.left = `${options.position.left}px`;
  popup.style.minWidth = `${options.popupMinWidth}px`;
  popup.style.maxWidth = options.popupMaxWidth;

  const arrow = document.createElement('span');
  arrow.className = 'mr-popup-arrow';

  const header = document.createElement('div');
  header.className = 'mr-popup-header';
  header.addEventListener('pointerdown', (event) => {
    options.onStartDrag(event);
  });

  const actions = document.createElement('div');
  actions.className = 'mr-popup-actions';

  const tabBar = document.createElement('div');
  tabBar.className = 'mr-tab-bar';

  const viewTab = document.createElement('button');
  viewTab.type = 'button';
  viewTab.className = 'mr-tab';
  viewTab.textContent = 'View';
  viewTab.addEventListener('click', () => {
    options.onViewTab();
  });

  const editorTab = document.createElement('button');
  editorTab.type = 'button';
  editorTab.className = 'mr-tab';
  editorTab.textContent = 'Editor';
  editorTab.addEventListener('click', () => {
    options.onEditorTab();
  });

  tabBar.appendChild(viewTab);
  tabBar.appendChild(editorTab);

  const message = document.createElement('div');
  message.className = 'mr-popup-message';

  const loading = document.createElement('div');
  loading.className = 'mr-popup-loading';

  const spinner = document.createElement('div');
  spinner.className = 'mr-spinner';

  const loadingText = document.createElement('span');
  loadingText.textContent = 'Rendering...';

  loading.appendChild(spinner);
  loading.appendChild(loadingText);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'mr-popup-content-wrapper';

  const content = document.createElement('div');
  content.className = 'mr-popup-content';
  content.style.height = `${options.popupDefaultHeight}px`;
  content.style.maxHeight = `${options.popupDefaultHeight}px`;
  content.addEventListener('pointerdown', (event) => {
    options.onStartPan(event);
  });

  const diagram = document.createElement('div');
  diagram.className = 'mr-popup-diagram';
  content.appendChild(diagram);

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'mr-floating-button mr-button-reset mr-copy-button';
  copyButton.setAttribute('aria-label', 'Copy Mermaid code');
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
  copyIcon.className = 'mr-floating-icon';
  copyButton.appendChild(copyIcon);

  const copyTooltip = document.createElement('div');
  copyTooltip.className = 'mr-floating-tooltip mr-copy-tooltip';
  copyTooltip.setAttribute('data-pan-ignore', 'true');
  copyTooltip.textContent = 'Copy Mermaid code';

  const splitButton = document.createElement('button');
  splitButton.type = 'button';
  splitButton.className = 'mr-floating-button mr-button-reset mr-split-button';
  splitButton.setAttribute('aria-label', 'Split editor');
  splitButton.setAttribute('data-pan-ignore', 'true');
  splitButton.addEventListener('mouseenter', () => {
    options.onSplitEnter();
  });
  splitButton.addEventListener('mouseleave', () => {
    options.onSplitLeave();
  });
  splitButton.addEventListener('click', () => {
    options.onSplitClick();
  });

  const splitIcon = document.createElement('img');
  splitIcon.alt = '';
  splitIcon.src = options.splitIconUrl;
  splitIcon.className = 'mr-floating-icon';
  splitButton.appendChild(splitIcon);

  const splitTooltip = document.createElement('div');
  splitTooltip.className = 'mr-floating-tooltip mr-split-tooltip';
  splitTooltip.setAttribute('data-pan-ignore', 'true');
  splitTooltip.textContent = 'Split editor';

  const zoomControls = document.createElement('div');
  zoomControls.className = 'mr-zoom-controls';
  zoomControls.setAttribute('data-zoom-control', 'true');

  const zoomOutButton = document.createElement('button');
  zoomOutButton.type = 'button';
  zoomOutButton.className = 'mr-zoom-button';
  zoomOutButton.setAttribute('aria-label', 'Zoom out');
  zoomOutButton.setAttribute('data-zoom-control', 'true');
  zoomOutButton.addEventListener('click', () => {
    options.onZoomOut();
  });

  const zoomOutIcon = document.createElement('img');
  zoomOutIcon.alt = '';
  zoomOutIcon.src = options.zoomOutIconUrl;
  zoomOutIcon.className = 'mr-zoom-icon';
  zoomOutButton.appendChild(zoomOutIcon);

  const zoomInButton = document.createElement('button');
  zoomInButton.type = 'button';
  zoomInButton.className = 'mr-zoom-button';
  zoomInButton.setAttribute('aria-label', 'Zoom in');
  zoomInButton.setAttribute('data-zoom-control', 'true');
  zoomInButton.addEventListener('click', () => {
    options.onZoomIn();
  });

  const zoomInIcon = document.createElement('img');
  zoomInIcon.alt = '';
  zoomInIcon.src = options.zoomInIconUrl;
  zoomInIcon.className = 'mr-zoom-icon';
  zoomInButton.appendChild(zoomInIcon);

  zoomControls.appendChild(zoomOutButton);
  zoomControls.appendChild(zoomInButton);
  content.appendChild(zoomControls);

  const editorPanel = document.createElement('div');
  editorPanel.className = 'mr-editor-panel';

  const editorTextarea = document.createElement('textarea');
  editorTextarea.className = 'mr-editor-textarea';
  editorTextarea.style.minHeight = options.editorTextareaMinHeight;
  editorTextarea.style.height = options.editorTextareaHeight;
  editorTextarea.addEventListener('input', () => {
    options.onEditorInput(editorTextarea.value);
  });

  editorPanel.appendChild(editorTextarea);

  contentWrapper.appendChild(copyButton);
  contentWrapper.appendChild(copyTooltip);
  contentWrapper.appendChild(splitButton);
  contentWrapper.appendChild(splitTooltip);
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
  resizeHandle.className = 'mr-resize-handle';
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
    splitButton,
    splitTooltip,
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
  elements.root.dataset.theme = theme;
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
