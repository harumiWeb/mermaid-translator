import { render } from 'preact';
import { extractMermaidCode, isMermaidLike } from '../shared/detectMermaid';
import { isRenderCacheHit } from '../shared/renderCache';
import { settingsStorageKeys, type Settings } from '../shared/settings';
import {
  isPopupThemePreference,
  type PopupThemePreference,
} from '../shared/themeOptions';
import { createDiagramControls } from './diagramControls';
import { createEditModeController } from './editMode';
import {
  applyPopupTheme,
  clampPopupToViewport,
  createPopupDom,
  destroyPopupDom,
  type PopupElements,
} from './popupDom';
import { ensurePopupStyle } from './popupStyle';
import {
  getButtonPosition,
  getPopupPosition,
  getSelectionInfo,
  type ButtonPosition,
} from './selection';
import {
  getNextPopupTheme,
  isThemePreference,
  loadPopupThemePreference,
  loadThemePreference,
  resolvePopupTheme,
  resolveTheme,
  savePopupThemePreference,
  saveThemePreference,
  themeOptions,
  type ThemeName,
  type ThemePreference,
} from './theme';
import { ActionButton, PopupActions } from './ui';

const isDev = import.meta.env.DEV;
const isLoggingEnabled =
  isDev || import.meta.env.VITE_ENABLE_LOGGING === 'true';

const kaTeXWarningSnippet = "KaTeX doesn't work in quirks mode.";
const svgSerializer = new XMLSerializer();

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
loadSettingsFromStorage();
try {
  chrome.runtime.onMessage.addListener((message) => {
    handleSettingsMessage(message);
  });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }

    const next: Settings = {
      mermaidTheme: themePreference ?? loadThemePreference(),
      popupTheme: popupThemePreference ?? loadPopupThemePreference(),
      openInEditMode: openInEditModeDefault,
    };

    const mermaidChange = changes[settingsStorageKeys.mermaidTheme];
    if (mermaidChange) {
      next.mermaidTheme = resolveMermaidPreference(
        mermaidChange.newValue,
        next.mermaidTheme
      );
    }

    const popupChange = changes[settingsStorageKeys.popupTheme];
    if (popupChange) {
      next.popupTheme = resolvePopupPreference(
        popupChange.newValue,
        next.popupTheme
      );
    }

    const editChange = changes[settingsStorageKeys.openInEditMode];
    if (editChange && typeof editChange.newValue === 'boolean') {
      next.openInEditMode = editChange.newValue;
    }

    applySettings(next);
    applySettingsToActivePopup();
  });
} catch {
  // ignore
}

let lastSelectionText: string | null = null;
let mountNode: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let popupRoot: HTMLElement | null = null;
let popupElements: PopupElements | null = null;
let popupSelectionText: string | null = null;
let popupMessage: HTMLElement | null = null;
let popupSvg: string | null = null;
let lastRenderedSource: string | null = null;
let lastRenderedTheme: ThemeName | null = null;
let popupActionsMount: HTMLElement | null = null;
let popupActionsState = {
  svgEnabled: false,
  pngEnabled: false,
  openEnabled: false,
  editEnabled: false,
};
let isPopupArrowHidden = false;
let isPopupMaxWidthDisabled = false;
let openInEditModeDefault = false;
let popupDiagram: HTMLElement | null = null;
let popupEditorTextarea: HTMLTextAreaElement | null = null;
let popupSourceText: string | null = null;
let popupEditorText: string | null = null;
let isEditorSplit = false;
let editorPopupRoot: HTMLElement | null = null;
let editorPopupHeader: HTMLElement | null = null;
let _editorPopupResizeHandle: HTMLElement | null = null;
let editorPopupCloseButton: HTMLButtonElement | null = null;
let editorPopupContent: HTMLElement | null = null;
let editorPopupDragState: {
  pointerId: number;
  startX: number;
  startY: number;
  startTop: number;
  startLeft: number;
  width: number;
  height: number;
} | null = null;
let editorPopupResizeState: {
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startTop: number;
  startLeft: number;
  direction: ResizeDirection;
} | null = null;
let editorRenderTimeout: number | null = null;
let popupDragState: {
  pointerId: number;
  startX: number;
  startY: number;
  startTop: number;
  startLeft: number;
  width: number;
  height: number;
} | null = null;
let popupResizeState: {
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startTop: number;
  startLeft: number;
  direction: ResizeDirection;
} | null = null;
let themePreference: ThemePreference | null = null;
let popupThemePreference: PopupThemePreference | null = null;
let outsidePointerHandler: ((event: PointerEvent) => void) | null = null;
let resizeHandler: (() => void) | null = null;
let beforeUnloadBound = false;

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

function resolveIconUrl(): string {
  try {
    return chrome.runtime.getURL('icons/mermaid-icon.svg');
  } catch {
    return '';
  }
}

const iconUrl = resolveIconUrl();
const externalIconUrl = chrome.runtime.getURL('icons/external-link-icon.svg');
const editIconUrl = chrome.runtime.getURL('icons/edit.svg');
const zoomInIconUrl = chrome.runtime.getURL('icons/zoom.svg');
const zoomOutIconUrl = chrome.runtime.getURL('icons/zoom-out.svg');
const copyIconUrl = chrome.runtime.getURL('icons/copy.svg');
const splitIconUrl = chrome.runtime.getURL('icons/split-window.svg');
const closeIconUrl = chrome.runtime.getURL('icons/close.svg');
const sunIconUrl = chrome.runtime.getURL('icons/sun.svg');
const moonIconUrl = chrome.runtime.getURL('icons/moon.svg');
const appIconUrl = chrome.runtime.getURL('icons/icon48.png');
const tooltipText = 'View Mermaid diagram';
const renderErrorMessage = 'Unable to render Mermaid diagram.';
const popupMinWidth = 550;
const popupMaxWidth = '50vw';
const popupDefaultMaxHeight = 320;
const popupEditMaxHeightRatio = 0.8;
const popupEditWidth = '80vw';
const popupEditMaxHeight = '80vh';
const popupEditContentMaxHeight = '55vh';
const popupEditMinHeight = 320;
const popupInitialContentHeight = Math.round(popupEditMinHeight * 1.5);
const resizeEdgeSize = 8;
const zoomStep = 0.1;
const popupZIndexBase = 2147483646;
const popupZIndexTop = 2147483647;
const diagramControls = createDiagramControls();
const editMode = createEditModeController(
  {
    popupEditWidth,
    popupEditMaxHeight,
    popupEditContentMaxHeight,
    popupDefaultMaxHeight,
    popupMaxWidth,
    popupInitialContentHeight,
  },
  () => {
    handleEditModeViewRender();
  }
);

function ensureMountNode(): HTMLElement | null {
  if (mountNode) {
    return mountNode;
  }

  if (!themePreference) {
    themePreference = loadThemePreference();
  }
  if (!popupThemePreference) {
    popupThemePreference = loadPopupThemePreference();
  }

  const host = document.createElement('div');
  host.setAttribute('data-mermaid-selection-renderer', 'root');

  const shadow = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadow.appendChild(container);
  ensurePopupStyle(shadow);

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

function setLoadingVisible(visible: boolean): void {
  if (!popupElements) {
    return;
  }

  popupElements.loading.style.display = visible ? 'flex' : 'none';
}

function setSplitTooltip(visible: boolean): void {
  if (!popupElements) {
    return;
  }

  popupElements.splitTooltip.classList.toggle('is-visible', visible);
}

function setSplitEnabled(enabled: boolean): void {
  if (!popupElements) {
    return;
  }

  popupElements.splitButton.style.display = enabled ? 'inline-flex' : 'none';
}

function setSplitActive(active: boolean): void {
  if (!popupElements) {
    return;
  }

  popupElements.splitButton.disabled = active;
  popupElements.splitButton.style.opacity = active ? '0.5' : '1';
  if (active) {
    setSplitTooltip(false);
  }
}

function updateSplitLayout(): void {
  if (!popupElements) {
    return;
  }

  const topOffset = editMode.isEnabled() ? 12 : 8;
  popupElements.splitButton.style.top = `${topOffset}px`;
  popupElements.splitTooltip.style.top = `${topOffset}px`;
}

function updateSplitTheme(theme: 'light' | 'dark'): void {
  void theme;
}

function updateEditorPopupLayout(): void {
  if (!editorPopupRoot || !popupEditorTextarea || !editorPopupContent) {
    return;
  }

  const available = editorPopupContent.clientHeight;
  popupEditorTextarea.style.height = `${Math.max(0, available)}px`;
}

function clampEditorPopupToViewport(): void {
  if (!editorPopupRoot) {
    return;
  }

  const rect = editorPopupRoot.getBoundingClientRect();
  const maxTop = window.innerHeight - rect.height - 4;
  const maxLeft = window.innerWidth - rect.width - 4;
  const clampedTop = Math.max(4, Math.min(rect.top, maxTop));
  const clampedLeft = Math.max(4, Math.min(rect.left, maxLeft));

  if (clampedTop !== rect.top) {
    editorPopupRoot.style.top = `${Math.floor(clampedTop)}px`;
  }
  if (clampedLeft !== rect.left) {
    editorPopupRoot.style.left = `${Math.floor(clampedLeft)}px`;
  }
}

function scheduleRender(callback: () => void): void {
  window.requestAnimationFrame(() => {
    callback();
  });
}

function setActionsEnabled(enabled: boolean): void {
  if (!popupActionsMount) {
    return;
  }

  popupActionsState = {
    ...popupActionsState,
    svgEnabled: enabled,
    pngEnabled: enabled,
    openEnabled: enabled,
  };
  renderPopupActions();
}

function setEditEnabled(enabled: boolean): void {
  if (!popupActionsMount) {
    return;
  }

  popupActionsState = {
    ...popupActionsState,
    editEnabled: enabled,
  };
  renderPopupActions();
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveMermaidPreference(
  value: unknown,
  fallback: ThemePreference
): ThemePreference {
  if (typeof value === 'string' && isThemePreference(value)) {
    return value;
  }
  return fallback;
}

function resolvePopupPreference(
  value: unknown,
  fallback: PopupThemePreference
): PopupThemePreference {
  if (typeof value === 'string' && isPopupThemePreference(value)) {
    return value;
  }
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeSettings(raw: Record<string, unknown>): {
  settings: Settings;
  shouldPersist: boolean;
} {
  const mermaidRaw = raw[settingsStorageKeys.mermaidTheme];
  const popupRaw = raw[settingsStorageKeys.popupTheme];
  const editRaw = raw[settingsStorageKeys.openInEditMode];

  const mermaidTheme = resolveMermaidPreference(
    mermaidRaw,
    loadThemePreference()
  );
  const popupTheme = resolvePopupPreference(
    popupRaw,
    loadPopupThemePreference()
  );
  const openInEditMode = typeof editRaw === 'boolean' ? editRaw : false;

  const shouldPersist =
    typeof mermaidRaw !== 'string' ||
    !isThemePreference(mermaidRaw) ||
    typeof popupRaw !== 'string' ||
    !isPopupThemePreference(popupRaw) ||
    typeof editRaw !== 'boolean';

  return {
    settings: {
      mermaidTheme,
      popupTheme,
      openInEditMode,
    },
    shouldPersist,
  };
}

function applySettings(settings: Settings): void {
  themePreference = settings.mermaidTheme;
  popupThemePreference = settings.popupTheme;
  openInEditModeDefault = settings.openInEditMode;
  saveThemePreference(settings.mermaidTheme);
  savePopupThemePreference(settings.popupTheme);
}

function applySettingsToActivePopup(): void {
  if (!popupRoot || !popupElements) {
    return;
  }

  const popupTheme = resolvePopupTheme(popupThemePreference ?? 'system');
  applyPopupTheme(popupElements, popupTheme);
  diagramControls.updateZoomTheme(popupTheme);
  diagramControls.updateCopyTheme(popupTheme);
  editMode.updateTheme(popupTheme);
  updateSplitTheme(popupTheme);
  if (editorPopupRoot) {
    applyEditorPopupTheme(popupTheme);
  }
  renderPopupActions();
  rerenderPopup(resolveTheme(themePreference ?? 'system'));
}

function saveSettingsToStorage(settings: Settings): void {
  try {
    chrome.storage.local.set({
      [settingsStorageKeys.mermaidTheme]: settings.mermaidTheme,
      [settingsStorageKeys.popupTheme]: settings.popupTheme,
      [settingsStorageKeys.openInEditMode]: settings.openInEditMode,
    });
  } catch {
    // ignore
  }
}

function loadSettingsFromStorage(): void {
  try {
    chrome.storage.local.get(
      [
        settingsStorageKeys.mermaidTheme,
        settingsStorageKeys.popupTheme,
        settingsStorageKeys.openInEditMode,
      ],
      (raw) => {
        const { settings, shouldPersist } = normalizeSettings(raw);
        applySettings(settings);
        if (shouldPersist) {
          saveSettingsToStorage(settings);
        }
      }
    );
  } catch {
    // ignore
  }
}

function handleSettingsMessage(message: unknown): void {
  if (!message || typeof message !== 'object') {
    return;
  }
  const payload = (message as { type?: string; payload?: unknown }).payload;
  const type = (message as { type?: string }).type;
  if (type !== 'settings:update' || !isRecord(payload)) {
    return;
  }

  const raw = payload;
  const next: Settings = {
    mermaidTheme: resolveMermaidPreference(
      'mermaidTheme' in raw ? raw['mermaidTheme'] : undefined,
      themePreference ?? loadThemePreference()
    ),
    popupTheme: resolvePopupPreference(
      'popupTheme' in raw ? raw['popupTheme'] : undefined,
      popupThemePreference ?? loadPopupThemePreference()
    ),
    openInEditMode:
      'openInEditMode' in raw && typeof raw['openInEditMode'] === 'boolean'
        ? raw['openInEditMode']
        : openInEditModeDefault,
  };

  applySettings(next);
  applySettingsToActivePopup();
}

function openEditMode(tab: 'view' | 'editor'): void {
  if (!popupSourceText) {
    return;
  }

  popupEditorText = popupEditorText ?? popupSourceText;
  diagramControls.setEditorText(popupEditorText);
  if (popupEditorTextarea) {
    popupEditorTextarea.value = popupEditorText;
  }
  editMode.setActiveTab(tab);
  diagramControls.setActiveTab(tab);
  editMode.setEnabled(true);
  diagramControls.setEditModeEnabled(true);
  diagramControls.updateCopyLayout();
  setSplitEnabled(true);
  updateSplitLayout();
  updateSplitTheme(resolvePopupTheme(popupThemePreference ?? 'system'));
  editMode.updateTheme(resolvePopupTheme(popupThemePreference ?? 'system'));
}

function hidePopupArrow(): void {
  if (isPopupArrowHidden || !popupElements) {
    return;
  }

  popupElements.arrow.style.display = 'none';
  isPopupArrowHidden = true;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      'button, select, option, textarea, input, a, [data-pan-ignore], [data-zoom-control]'
    )
  );
}

function getResizeDirection(
  rect: DOMRect,
  event: PointerEvent,
  edgeSize: number
): ResizeDirection | null {
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  const onLeft = offsetX >= 0 && offsetX <= edgeSize;
  const onRight = offsetX >= rect.width - edgeSize && offsetX <= rect.width;
  const onTop = offsetY >= 0 && offsetY <= edgeSize;
  const onBottom = offsetY >= rect.height - edgeSize && offsetY <= rect.height;

  if ((onLeft && onRight) || (onTop && onBottom)) {
    return null;
  }

  if (onTop && onLeft) {
    return 'nw';
  }
  if (onTop && onRight) {
    return 'ne';
  }
  if (onBottom && onLeft) {
    return 'sw';
  }
  if (onBottom && onRight) {
    return 'se';
  }
  if (onTop) {
    return 'n';
  }
  if (onBottom) {
    return 's';
  }
  if (onLeft) {
    return 'w';
  }
  if (onRight) {
    return 'e';
  }

  return null;
}

function getResizeCursor(direction: ResizeDirection | null): string {
  if (!direction) {
    return '';
  }
  if (direction === 'n' || direction === 's') {
    return 'ns-resize';
  }
  if (direction === 'e' || direction === 'w') {
    return 'ew-resize';
  }
  if (direction === 'ne' || direction === 'sw') {
    return 'nesw-resize';
  }
  return 'nwse-resize';
}

function handleWindowResize(): void {
  if (!popupRoot) {
    return;
  }

  if (editMode.isEnabled()) {
    editMode.updateLayout();
  }
  if (popupElements) {
    clampPopupToViewport(popupElements);
  }
  diagramControls.updateCopyLayout();
  updateSplitLayout();
  clampEditorPopupToViewport();
  updateEditorPopupLayout();
}

function handleEditModeViewRender(): void {
  if (!editMode.isEnabled()) {
    return;
  }
  if (!popupDiagram) {
    return;
  }

  const theme = resolveTheme(themePreference ?? 'system');
  const source = popupEditorText ?? '';

  if (source.trim().length === 0) {
    popupSvg = null;
    setPopupMessage(renderErrorMessage);
    setActionsEnabled(false);
    setLoadingVisible(false);
    return;
  }

  if (
    isRenderCacheHit({
      lastSvg: popupSvg,
      lastSource: lastRenderedSource,
      lastTheme: lastRenderedTheme,
      nextSource: source,
      nextTheme: theme,
    })
  ) {
    setPopupMessage(null);
    setActionsEnabled(true);
    setLoadingVisible(false);
    return;
  }

  setPopupMessage(null);
  setActionsEnabled(false);
  setLoadingVisible(true);
  scheduleRender(() => {
    const diagram = popupDiagram;
    if (!diagram) {
      setPopupMessage(renderErrorMessage);
      setActionsEnabled(false);
      setLoadingVisible(false);
      return;
    }
    void import('./mermaidRenderer')
      .then(({ renderMermaid }) => renderMermaid(source, diagram, theme))
      .then((svgElement) => {
        if (!svgElement) {
          popupSvg = null;
          setPopupMessage(renderErrorMessage);
          setActionsEnabled(false);
          setLoadingVisible(false);
          return;
        }

        popupSvg = svgSerializer.serializeToString(svgElement);
        lastRenderedSource = source;
        lastRenderedTheme = theme;
        popupSourceText = source;
        diagramControls.setSourceText(source);
        setPopupMessage(null);
        setActionsEnabled(true);
        setEditEnabled(!editMode.isEnabled());
        setLoadingVisible(false);
        if (popupElements) {
          clampPopupToViewport(popupElements);
        }
      })
      .catch(() => {
        popupSvg = null;
        setPopupMessage(renderErrorMessage);
        setActionsEnabled(false);
        setLoadingVisible(false);
      });
  });
}

function stopDrag(): void {
  if (!popupDragState) {
    return;
  }

  window.removeEventListener('pointermove', handleDragMove);
  popupDragState = null;
}

function handleDragMove(event: PointerEvent): void {
  if (!popupDragState || !popupRoot) {
    return;
  }

  if (event.pointerId !== popupDragState.pointerId) {
    return;
  }

  const deltaX = event.clientX - popupDragState.startX;
  const deltaY = event.clientY - popupDragState.startY;
  const maxLeft = window.innerWidth - popupDragState.width - 8;
  const maxTop = window.innerHeight - popupDragState.height - 8;

  const nextLeft = clampValue(
    popupDragState.startLeft + deltaX,
    8,
    Math.max(8, maxLeft)
  );
  const nextTop = clampValue(
    popupDragState.startTop + deltaY,
    8,
    Math.max(8, maxTop)
  );

  popupRoot.style.left = `${Math.floor(nextLeft)}px`;
  popupRoot.style.top = `${Math.floor(nextTop)}px`;
}

function startDrag(event: PointerEvent): void {
  if (!popupRoot) {
    return;
  }

  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.closest('button, select, option, textarea, input, a')
  ) {
    return;
  }

  const rect = popupRoot.getBoundingClientRect();
  if (getResizeDirection(rect, event, resizeEdgeSize)) {
    return;
  }

  event.preventDefault();
  hidePopupArrow();
  popupDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startTop: rect.top,
    startLeft: rect.left,
    width: rect.width,
    height: rect.height,
  };
  window.addEventListener('pointermove', handleDragMove);
  window.addEventListener(
    'pointerup',
    () => {
      stopDrag();
    },
    { once: true }
  );
}

function stopResize(): void {
  if (!popupResizeState) {
    return;
  }

  window.removeEventListener('pointermove', handleResizeMove);
  popupResizeState = null;
}

function handleResizeMove(event: PointerEvent): void {
  if (!popupResizeState || !popupRoot) {
    return;
  }

  if (event.pointerId !== popupResizeState.pointerId) {
    return;
  }

  const deltaX = event.clientX - popupResizeState.startX;
  const deltaY = event.clientY - popupResizeState.startY;

  const direction = popupResizeState.direction;
  const startLeft = popupResizeState.startLeft;
  const startTop = popupResizeState.startTop;
  const startWidth = popupResizeState.startWidth;
  const startHeight = popupResizeState.startHeight;
  const right = startLeft + startWidth;
  const bottom = startTop + startHeight;
  const minLeft = 8;
  const minTop = 8;
  const maxRight = window.innerWidth - 8;
  const maxBottom = window.innerHeight - 8;
  const isEditMode = editMode.isEnabled();
  const allowFullWidth = isEditMode || isPopupMaxWidthDisabled;
  const maxWidthLimitDefault = Math.floor(window.innerWidth * 0.5);
  const maxWidthLimitEast = allowFullWidth
    ? maxRight - startLeft
    : Math.min(maxRight - startLeft, maxWidthLimitDefault);
  const maxWidthLimitWest = allowFullWidth
    ? right - minLeft
    : Math.min(right - minLeft, maxWidthLimitDefault);
  const maxHeightLimit = isEditMode
    ? Math.min(
        Math.floor(window.innerHeight * popupEditMaxHeightRatio),
        maxBottom - minTop
      )
    : maxBottom - minTop;

  let nextLeft = startLeft;
  let nextTop = startTop;
  let nextWidth = startWidth;
  let nextHeight = startHeight;

  if (direction.includes('e')) {
    const maxWidth = Math.max(popupMinWidth, maxWidthLimitEast);
    nextWidth = clampValue(startWidth + deltaX, popupMinWidth, maxWidth);
  }
  if (direction.includes('w')) {
    const maxWidth = Math.max(popupMinWidth, maxWidthLimitWest);
    const rawWidth = clampValue(startWidth - deltaX, popupMinWidth, maxWidth);
    nextWidth = rawWidth;
    nextLeft = right - rawWidth;
  }
  if (direction.includes('s')) {
    const maxHeight = Math.max(
      popupEditMinHeight,
      Math.min(maxHeightLimit, maxBottom - startTop)
    );
    nextHeight = clampValue(
      startHeight + deltaY,
      popupEditMinHeight,
      maxHeight
    );
  }
  if (direction.includes('n')) {
    const maxHeight = Math.max(
      popupEditMinHeight,
      Math.min(maxHeightLimit, bottom - minTop)
    );
    const rawHeight = clampValue(
      startHeight - deltaY,
      popupEditMinHeight,
      maxHeight
    );
    nextHeight = rawHeight;
    nextTop = bottom - rawHeight;
  }

  popupRoot.style.width = `${Math.floor(nextWidth)}px`;
  popupRoot.style.height = `${Math.floor(nextHeight)}px`;
  popupRoot.style.left = `${Math.floor(nextLeft)}px`;
  popupRoot.style.top = `${Math.floor(nextTop)}px`;
  editMode.updateLayout();
  if (popupElements) {
    clampPopupToViewport(popupElements);
  }
}

function startResize(event: PointerEvent): void {
  if (!popupRoot) {
    return;
  }

  const rect = popupRoot.getBoundingClientRect();
  const direction = getResizeDirection(rect, event, resizeEdgeSize);
  if (!direction || isInteractiveTarget(event.target)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  hidePopupArrow();
  popupRoot.style.maxWidth = 'none';
  isPopupMaxWidthDisabled = true;
  popupResizeState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: rect.width,
    startHeight: rect.height,
    startTop: rect.top,
    startLeft: rect.left,
    direction,
  };
  window.addEventListener('pointermove', handleResizeMove);
  window.addEventListener(
    'pointerup',
    () => {
      stopResize();
    },
    { once: true }
  );
}

function updatePopupResizeCursor(event: PointerEvent): void {
  if (!popupRoot) {
    return;
  }

  const rect = popupRoot.getBoundingClientRect();
  const direction = getResizeDirection(rect, event, resizeEdgeSize);
  const nextCursor =
    direction && !isInteractiveTarget(event.target)
      ? getResizeCursor(direction)
      : '';
  popupRoot.style.cursor = nextCursor;
}

function stopEditorDrag(): void {
  if (!editorPopupDragState) {
    return;
  }

  window.removeEventListener('pointermove', handleEditorDragMove);
  editorPopupDragState = null;
}

function handleEditorDragMove(event: PointerEvent): void {
  if (!editorPopupDragState || !editorPopupRoot) {
    return;
  }

  if (event.pointerId !== editorPopupDragState.pointerId) {
    return;
  }

  const deltaX = event.clientX - editorPopupDragState.startX;
  const deltaY = event.clientY - editorPopupDragState.startY;
  const maxLeft = window.innerWidth - editorPopupDragState.width - 8;
  const maxTop = window.innerHeight - editorPopupDragState.height - 8;

  const nextLeft = clampValue(
    editorPopupDragState.startLeft + deltaX,
    8,
    Math.max(8, maxLeft)
  );
  const nextTop = clampValue(
    editorPopupDragState.startTop + deltaY,
    8,
    Math.max(8, maxTop)
  );

  editorPopupRoot.style.left = `${Math.floor(nextLeft)}px`;
  editorPopupRoot.style.top = `${Math.floor(nextTop)}px`;
}

function startEditorDrag(event: PointerEvent): void {
  if (!editorPopupRoot || !editorPopupHeader) {
    return;
  }

  const target = event.target;
  if (target instanceof HTMLElement && target.closest('button')) {
    return;
  }

  const rect = editorPopupRoot.getBoundingClientRect();
  if (getResizeDirection(rect, event, resizeEdgeSize)) {
    return;
  }

  event.preventDefault();
  editorPopupDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startTop: rect.top,
    startLeft: rect.left,
    width: rect.width,
    height: rect.height,
  };
  window.addEventListener('pointermove', handleEditorDragMove);
  window.addEventListener(
    'pointerup',
    () => {
      stopEditorDrag();
    },
    { once: true }
  );
}

function stopEditorResize(): void {
  if (!editorPopupResizeState) {
    return;
  }

  window.removeEventListener('pointermove', handleEditorResizeMove);
  editorPopupResizeState = null;
}

function handleEditorResizeMove(event: PointerEvent): void {
  if (!editorPopupResizeState || !editorPopupRoot) {
    return;
  }

  if (event.pointerId !== editorPopupResizeState.pointerId) {
    return;
  }

  const deltaX = event.clientX - editorPopupResizeState.startX;
  const deltaY = event.clientY - editorPopupResizeState.startY;

  const direction = editorPopupResizeState.direction;
  const startLeft = editorPopupResizeState.startLeft;
  const startTop = editorPopupResizeState.startTop;
  const startWidth = editorPopupResizeState.startWidth;
  const startHeight = editorPopupResizeState.startHeight;
  const right = startLeft + startWidth;
  const bottom = startTop + startHeight;
  const minLeft = 8;
  const minTop = 8;
  const maxRight = window.innerWidth - 8;
  const maxBottom = window.innerHeight - 8;

  let nextLeft = startLeft;
  let nextTop = startTop;
  let nextWidth = startWidth;
  let nextHeight = startHeight;

  if (direction.includes('e')) {
    const maxWidth = Math.max(popupMinWidth, maxRight - startLeft);
    nextWidth = clampValue(startWidth + deltaX, popupMinWidth, maxWidth);
  }
  if (direction.includes('w')) {
    const maxWidth = Math.max(popupMinWidth, right - minLeft);
    const rawWidth = clampValue(startWidth - deltaX, popupMinWidth, maxWidth);
    nextWidth = rawWidth;
    nextLeft = right - rawWidth;
  }
  if (direction.includes('s')) {
    const maxHeight = Math.max(popupEditMinHeight, maxBottom - startTop);
    nextHeight = clampValue(
      startHeight + deltaY,
      popupEditMinHeight,
      maxHeight
    );
  }
  if (direction.includes('n')) {
    const maxHeight = Math.max(popupEditMinHeight, bottom - minTop);
    const rawHeight = clampValue(
      startHeight - deltaY,
      popupEditMinHeight,
      maxHeight
    );
    nextHeight = rawHeight;
    nextTop = bottom - rawHeight;
  }

  editorPopupRoot.style.width = `${Math.floor(nextWidth)}px`;
  editorPopupRoot.style.height = `${Math.floor(nextHeight)}px`;
  editorPopupRoot.style.left = `${Math.floor(nextLeft)}px`;
  editorPopupRoot.style.top = `${Math.floor(nextTop)}px`;
  updateEditorPopupLayout();
  clampEditorPopupToViewport();
}

function startEditorResize(event: PointerEvent): void {
  if (!editorPopupRoot) {
    return;
  }

  const rect = editorPopupRoot.getBoundingClientRect();
  const direction = getResizeDirection(rect, event, resizeEdgeSize);
  if (!direction || isInteractiveTarget(event.target)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  editorPopupResizeState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: rect.width,
    startHeight: rect.height,
    startTop: rect.top,
    startLeft: rect.left,
    direction,
  };
  window.addEventListener('pointermove', handleEditorResizeMove);
  window.addEventListener(
    'pointerup',
    () => {
      stopEditorResize();
    },
    { once: true }
  );
}

function updateEditorResizeCursor(event: PointerEvent): void {
  if (!editorPopupRoot) {
    return;
  }

  const rect = editorPopupRoot.getBoundingClientRect();
  const direction = getResizeDirection(rect, event, resizeEdgeSize);
  const nextCursor =
    direction && !isInteractiveTarget(event.target)
      ? getResizeCursor(direction)
      : '';
  editorPopupRoot.style.cursor = nextCursor;
}

function applyEditorPopupTheme(theme: 'light' | 'dark'): void {
  if (!editorPopupRoot || !editorPopupCloseButton) {
    return;
  }

  editorPopupRoot.dataset['theme'] = theme;
}

function bringPopupToFront(target: 'main' | 'editor'): void {
  if (!popupRoot || !editorPopupRoot) {
    return;
  }

  if (target === 'main') {
    popupRoot.style.zIndex = String(popupZIndexTop);
    editorPopupRoot.style.zIndex = String(popupZIndexBase);
    popupRoot.focus();
    return;
  }

  editorPopupRoot.style.zIndex = String(popupZIndexTop);
  popupRoot.style.zIndex = String(popupZIndexBase);
  editorPopupRoot.focus();
}

function createEditorPopup(): void {
  if (!shadowRoot || !popupElements || !popupEditorTextarea) {
    return;
  }

  const contentWrapper = popupElements.content.parentElement;
  if (!contentWrapper) {
    return;
  }

  const editorPanel = popupElements.editorPanel;
  editorPanel.style.display = 'block';

  const baseRect = editorPanel.getBoundingClientRect();
  const popupRect = popupElements.root.getBoundingClientRect();

  const root = document.createElement('div');
  root.className = 'mr-editor-popup mr-theme';
  root.tabIndex = -1;
  root.style.width = `${Math.max(popupMinWidth, popupRect.width)}px`;
  root.style.height = `${Math.max(popupEditMinHeight, popupRect.height)}px`;

  const header = document.createElement('div');
  header.className = 'mr-editor-popup-header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'mr-editor-popup-header-left';

  const appIcon = document.createElement('img');
  appIcon.alt = '';
  appIcon.src = appIconUrl;
  appIcon.className = 'mr-popup-actions-app-icon';

  const title = document.createElement('div');
  title.textContent = 'Editor';
  title.className = 'mr-editor-popup-title';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close editor');
  closeButton.className = 'mr-editor-popup-close';

  const closeIcon = document.createElement('img');
  closeIcon.alt = '';
  closeIcon.src = closeIconUrl;
  closeIcon.className = 'mr-editor-popup-close-icon';
  closeButton.appendChild(closeIcon);

  closeButton.addEventListener('click', () => {
    closeEditorPopup();
  });

  headerLeft.appendChild(appIcon);
  headerLeft.appendChild(title);
  header.appendChild(headerLeft);
  header.appendChild(closeButton);
  header.addEventListener('pointerdown', (event) => {
    startEditorDrag(event);
  });

  const content = document.createElement('div');
  content.className = 'mr-editor-popup-content';

  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'mr-resize-handle is-visible';
  resizeHandle.addEventListener('pointerdown', (event) => {
    startEditorResize(event);
  });

  root.appendChild(header);
  root.appendChild(content);
  root.appendChild(resizeHandle);

  shadowRoot.appendChild(root);
  content.appendChild(editorPanel);
  editorPopupContent = content;

  root.addEventListener('pointerdown', (event) => {
    bringPopupToFront('editor');
    startEditorResize(event);
  });
  root.addEventListener('pointermove', (event) => {
    updateEditorResizeCursor(event);
  });
  root.addEventListener('pointerleave', () => {
    if (editorPopupRoot) {
      editorPopupRoot.style.cursor = '';
    }
  });

  if (!editorPanel.dataset['originalPaddingTop']) {
    editorPanel.dataset['originalPaddingTop'] = editorPanel.style.paddingTop;
  }
  editorPanel.style.paddingTop = '0';

  const offset = 16;
  const initialTop = baseRect.top + offset;
  const initialLeft = baseRect.left + offset;
  root.style.top = `${Math.floor(initialTop)}px`;
  root.style.left = `${Math.floor(initialLeft)}px`;

  editorPopupRoot = root;
  editorPopupHeader = header;
  _editorPopupResizeHandle = resizeHandle;
  editorPopupCloseButton = closeButton;
  updateEditorPopupLayout();

  applyEditorPopupTheme(resolvePopupTheme(popupThemePreference ?? 'system'));
  clampEditorPopupToViewport();
  updateEditorPopupLayout();

  popupElements.tabBar.style.display = 'none';
  popupElements.editorTab.style.display = 'none';
  editMode.setActiveTab('view');
  popupElements.editorPanel.style.display = 'block';

  isEditorSplit = true;
  setSplitActive(true);
  bringPopupToFront('editor');
}

function closeEditorPopup(): void {
  if (!editorPopupRoot || !popupElements) {
    return;
  }

  const contentWrapper = popupElements.content.parentElement;
  if (contentWrapper) {
    contentWrapper.appendChild(popupElements.editorPanel);
  }
  popupElements.editorPanel.style.display =
    editMode.getActiveTab() === 'editor' ? 'block' : 'none';

  editorPopupRoot.remove();
  editorPopupRoot = null;
  editorPopupHeader = null;
  _editorPopupResizeHandle = null;
  editorPopupCloseButton = null;
  editorPopupContent = null;
  editorPopupDragState = null;
  editorPopupResizeState = null;

  if (popupElements.editorPanel.dataset['originalPaddingTop'] !== undefined) {
    popupElements.editorPanel.style.paddingTop =
      popupElements.editorPanel.dataset['originalPaddingTop'];
    delete popupElements.editorPanel.dataset['originalPaddingTop'];
  }

  popupElements.tabBar.style.display = editMode.isEnabled() ? 'flex' : 'none';
  popupElements.editorTab.style.display = '';

  isEditorSplit = false;
  setSplitActive(false);
  if (popupRoot) {
    popupRoot.style.zIndex = '';
  }
}

function getCurrentRenderSource(): string | null {
  if (editMode.isEnabled() && popupEditorText !== null) {
    return popupEditorText;
  }
  if (popupSourceText) {
    return popupSourceText;
  }
  if (popupSelectionText) {
    return extractMermaidCode(popupSelectionText);
  }
  return null;
}

function rerenderPopup(theme: ThemeName): void {
  if (!popupDiagram) {
    return;
  }

  const code = getCurrentRenderSource();
  if (!code) {
    return;
  }
  if (
    isRenderCacheHit({
      lastSvg: popupSvg,
      lastSource: lastRenderedSource,
      lastTheme: lastRenderedTheme,
      nextSource: code,
      nextTheme: theme,
    })
  ) {
    setPopupMessage(null);
    setActionsEnabled(true);
    setLoadingVisible(false);
    return;
  }

  setPopupMessage(null);
  setActionsEnabled(false);
  setLoadingVisible(true);

  scheduleRender(() => {
    const diagram = popupDiagram;
    if (!diagram) {
      setPopupMessage(renderErrorMessage);
      setActionsEnabled(false);
      setLoadingVisible(false);
      return;
    }
    void import('./mermaidRenderer')
      .then(({ renderMermaid }) => renderMermaid(code, diagram, theme))
      .then((svgElement) => {
        if (!svgElement) {
          popupSvg = null;
          setPopupMessage(renderErrorMessage);
          setActionsEnabled(false);
          setLoadingVisible(false);
          return;
        }

        popupSvg = svgSerializer.serializeToString(svgElement);
        lastRenderedSource = code;
        lastRenderedTheme = theme;
        popupSourceText = code;
        diagramControls.setSourceText(code);
        setPopupMessage(null);
        setActionsEnabled(true);
        setLoadingVisible(false);
        if (popupRoot) {
          if (popupElements) {
            clampPopupToViewport(popupElements);
          }
        }
      })
      .catch(() => {
        popupSvg = null;
        setPopupMessage(renderErrorMessage);
        setActionsEnabled(false);
        setLoadingVisible(false);
      });
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
  const doc = document.implementation.createHTMLDocument('Mermaid Diagram');
  const meta = doc.createElement('meta');
  meta.setAttribute('charset', 'utf-8');
  doc.head.appendChild(meta);

  const style = doc.createElement('style');
  style.textContent =
    'html, body { margin: 0; padding: 0; background: #fff; }' +
    'svg { display: block; max-width: 100%; height: auto; }';
  doc.head.appendChild(style);

  const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
  if (svgElement instanceof SVGElement) {
    doc.body.appendChild(doc.importNode(svgElement, true));
  }

  const htmlMarkup = '<!doctype html>' + doc.documentElement.outerHTML;
  // eslint-disable-next-line xss/no-mixed-html -- HTML is generated from sanitized SVG content.
  const htmlBlob = new Blob([htmlMarkup], { type: 'text/html' });
  // eslint-disable-next-line xss/no-mixed-html -- URL is created from sanitized HTML blob.
  const url = URL.createObjectURL(htmlBlob);
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
        resolvedWidth = parts[2] ?? resolvedWidth;
        resolvedHeight = parts[3] ?? resolvedHeight;
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

  if (editorRenderTimeout !== null) {
    window.clearTimeout(editorRenderTimeout);
    editorRenderTimeout = null;
  }

  if (editorPopupRoot) {
    editorPopupRoot.remove();
    editorPopupRoot = null;
    editorPopupHeader = null;
    _editorPopupResizeHandle = null;
    editorPopupCloseButton = null;
    editorPopupDragState = null;
    editorPopupResizeState = null;
    isEditorSplit = false;
  }
  popupRoot.style.zIndex = '';

  stopDrag();
  stopResize();
  diagramControls.cleanup();
  diagramControls.setEditModeEnabled(false);
  if (popupElements) {
    destroyPopupDom(popupElements);
  }
  popupRoot = null;
  popupElements = null;
  popupSelectionText = null;
  popupMessage = null;
  popupSvg = null;
  lastRenderedSource = null;
  lastRenderedTheme = null;
  popupActionsMount = null;
  popupActionsState = {
    svgEnabled: false,
    pngEnabled: false,
    openEnabled: false,
    editEnabled: false,
  };
  popupDiagram = null;
  popupEditorTextarea = null;
  popupSourceText = null;
  popupEditorText = null;
  editMode.setEnabled(false);
  editMode.setActiveTab('view');
  editMode.setElements(null);
  popupDragState = null;
  popupResizeState = null;
  popupThemePreference = null;

  if (outsidePointerHandler) {
    document.removeEventListener('pointerdown', outsidePointerHandler, true);
    outsidePointerHandler = null;
  }

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
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

  const elements = createPopupDom(shadowRoot, {
    position,
    popupMinWidth,
    popupMaxWidth,
    popupDefaultMaxHeight,
    popupDefaultHeight: popupInitialContentHeight,
    editorTextareaHeight: popupEditContentMaxHeight,
    editorTextareaMinHeight: `${popupEditMinHeight}px`,
    copyIconUrl,
    splitIconUrl,
    zoomInIconUrl,
    zoomOutIconUrl,
    onStartDrag: startDrag,
    onStartResize: startResize,
    onStartPan: (event) => {
      diagramControls.startPan(event);
    },
    onViewTab: () => {
      editMode.setActiveTab('view');
      diagramControls.setActiveTab('view');
      editMode.updateTheme(resolvePopupTheme(popupThemePreference ?? 'system'));
    },
    onEditorTab: () => {
      editMode.setActiveTab('editor');
      diagramControls.setActiveTab('editor');
      editMode.updateTheme(resolvePopupTheme(popupThemePreference ?? 'system'));
    },
    onEditorInput: (value) => {
      popupEditorText = value;
      diagramControls.setEditorText(value);
      if (!isEditorSplit) {
        return;
      }
      if (editorRenderTimeout !== null) {
        window.clearTimeout(editorRenderTimeout);
      }
      editorRenderTimeout = window.setTimeout(() => {
        editorRenderTimeout = null;
        handleEditModeViewRender();
      }, 1000);
    },
    onCopyEnter: () => {
      diagramControls.handleCopyEnter();
    },
    onCopyLeave: () => {
      diagramControls.handleCopyLeave();
    },
    onCopyClick: () => {
      diagramControls.handleCopyClick();
    },
    onSplitEnter: () => {
      if (popupElements?.splitButton.disabled) {
        return;
      }
      setSplitTooltip(true);
    },
    onSplitLeave: () => {
      setSplitTooltip(false);
    },
    onSplitClick: () => {
      if (!editMode.isEnabled()) {
        return;
      }
      if (isEditorSplit) {
        closeEditorPopup();
        return;
      }
      createEditorPopup();
    },
    onZoomOut: () => {
      diagramControls.zoomBy(-zoomStep);
    },
    onZoomIn: () => {
      diagramControls.zoomBy(zoomStep);
    },
  });

  popupElements = elements;
  popupRoot = elements.root;
  popupSelectionText = selectionText;
  isPopupArrowHidden = false;
  isPopupMaxWidthDisabled = false;
  popupMessage = elements.message;
  setLoadingVisible(false);
  setSplitEnabled(false);
  setSplitActive(false);
  popupSvg = null;
  popupActionsMount = elements.actionsMount;
  popupDiagram = elements.diagram;
  popupEditorTextarea = elements.editorTextarea;
  editMode.setElements({
    root: elements.root,
    arrow: elements.arrow,
    header: elements.header,
    resizeHandle: elements.resizeHandle,
    tabBar: elements.tabBar,
    viewTab: elements.viewTab,
    editorTab: elements.editorTab,
    content: elements.content,
    editorPanel: elements.editorPanel,
    editorTextarea: elements.editorTextarea,
    message: elements.message,
  });
  editMode.setActiveTab('view');
  editMode.setEnabled(false);
  elements.arrow.style.display = '';
  if (!popupThemePreference) {
    popupThemePreference = loadPopupThemePreference();
  }
  applyPopupTheme(elements, resolvePopupTheme(popupThemePreference));
  clampPopupToViewport(elements);
  popupActionsState = {
    svgEnabled: false,
    pngEnabled: false,
    openEnabled: false,
    editEnabled: false,
  };

  popupRoot.addEventListener('pointerdown', (event) => {
    if (editorPopupRoot) {
      bringPopupToFront('main');
    }
    startResize(event);
  });
  popupRoot.addEventListener('pointermove', (event) => {
    updatePopupResizeCursor(event);
  });
  popupRoot.addEventListener('pointerleave', () => {
    if (popupRoot) {
      popupRoot.style.cursor = '';
    }
  });
  diagramControls.setElements({
    content: elements.content,
    diagram: elements.diagram,
    zoomControls: elements.zoomControls,
    zoomInButton: elements.zoomInButton,
    zoomOutButton: elements.zoomOutButton,
    copyButton: elements.copyButton,
    copyTooltip: elements.copyTooltip,
  });
  diagramControls.setEditModeEnabled(false);
  diagramControls.setActiveTab('view');
  diagramControls.setSourceText(null);
  diagramControls.setEditorText(null);
  diagramControls.updateZoomTheme(resolvePopupTheme(popupThemePreference));
  diagramControls.updateCopyTheme(resolvePopupTheme(popupThemePreference));
  diagramControls.updateCopyLayout();
  updateSplitTheme(resolvePopupTheme(popupThemePreference));
  updateSplitLayout();
  diagramControls.resetPanZoom();
  editMode.updateTheme(resolvePopupTheme(popupThemePreference));
  renderPopupActions();
  setActionsEnabled(false);

  outsidePointerHandler = (event: PointerEvent) => {
    if (!popupRoot) {
      return;
    }
    if (editMode.isEnabled()) {
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

  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }
  resizeHandler = handleWindowResize;
  window.addEventListener('resize', resizeHandler);

  return elements.diagram;
}

function renderPopupActions(): void {
  if (!popupActionsMount) {
    return;
  }

  const currentThemePreference = themePreference ?? 'system';
  const currentPopupTheme = resolvePopupTheme(popupThemePreference ?? 'system');

  render(
    <PopupActions
      svgEnabled={popupActionsState.svgEnabled}
      pngEnabled={popupActionsState.pngEnabled}
      openEnabled={popupActionsState.openEnabled}
      editEnabled={popupActionsState.editEnabled}
      themeOptions={themeOptions}
      themeValue={currentThemePreference}
      popupTheme={currentPopupTheme}
      openIconUrl={externalIconUrl}
      editIconUrl={editIconUrl}
      closeIconUrl={closeIconUrl}
      sunIconUrl={sunIconUrl}
      moonIconUrl={moonIconUrl}
      appIconUrl={appIconUrl}
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
      onEdit={() => {
        openEditMode('view');
      }}
      onThemeChange={(value) => {
        if (!isThemePreference(value)) {
          return;
        }
        themePreference = value;
        saveThemePreference(value);
        saveSettingsToStorage({
          mermaidTheme: value,
          popupTheme: popupThemePreference ?? loadPopupThemePreference(),
          openInEditMode: openInEditModeDefault,
        });
        renderPopupActions();
        rerenderPopup(resolveTheme(value));
      }}
      onTogglePopupTheme={() => {
        const next = getNextPopupTheme(popupThemePreference ?? 'system');
        popupThemePreference = next;
        savePopupThemePreference(next);
        saveSettingsToStorage({
          mermaidTheme: themePreference ?? loadThemePreference(),
          popupTheme: next,
          openInEditMode: openInEditModeDefault,
        });
        if (popupElements) {
          applyPopupTheme(popupElements, resolvePopupTheme(next));
        }
        diagramControls.updateZoomTheme(resolvePopupTheme(next));
        diagramControls.updateCopyTheme(resolvePopupTheme(next));
        editMode.updateTheme(resolvePopupTheme(next));
        updateSplitTheme(resolvePopupTheme(next));
        if (editorPopupRoot) {
          applyEditorPopupTheme(resolvePopupTheme(next));
        }
        renderPopupActions();
      }}
      onClose={() => {
        dismissPopup();
      }}
    />,
    popupActionsMount
  );
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
  const diagram = showPopup(popupPosition, selectionInfo.text);
  if (!diagram) {
    return;
  }

  const code = extractMermaidCode(selectionInfo.text);
  const theme = resolveTheme(themePreference ?? 'system');

  if (
    isRenderCacheHit({
      lastSvg: popupSvg,
      lastSource: lastRenderedSource,
      lastTheme: lastRenderedTheme,
      nextSource: code,
      nextTheme: theme,
    })
  ) {
    setPopupMessage(null);
    setActionsEnabled(true);
    setEditEnabled(true);
    setLoadingVisible(false);
    popupSourceText = code;
    popupEditorText = code;
    diagramControls.setSourceText(code);
    diagramControls.setEditorText(code);
    if (openInEditModeDefault) {
      openEditMode('view');
    }
    return;
  }

  setLoadingVisible(true);
  scheduleRender(() => {
    void import('./mermaidRenderer')
      .then(({ renderMermaid }) => renderMermaid(code, diagram, theme))
      .then((svgElement) => {
        if (!svgElement) {
          popupSvg = null;
          setPopupMessage(renderErrorMessage);
          setActionsEnabled(false);
          setEditEnabled(false);
          setLoadingVisible(false);
          if (popupElements) {
            clampPopupToViewport(popupElements);
          }
          return;
        }

        popupSvg = svgSerializer.serializeToString(svgElement);
        lastRenderedSource = code;
        lastRenderedTheme = theme;
        popupSourceText = code;
        popupEditorText = code;
        diagramControls.setSourceText(code);
        diagramControls.setEditorText(code);
        setPopupMessage(null);
        setActionsEnabled(true);
        setEditEnabled(true);
        setLoadingVisible(false);
        if (openInEditModeDefault) {
          openEditMode('view');
        }
        if (popupElements) {
          clampPopupToViewport(popupElements);
        }
      })
      .catch(() => {
        popupSvg = null;
        setPopupMessage(renderErrorMessage);
        setActionsEnabled(false);
        setEditEnabled(false);
        setLoadingVisible(false);
      });
  });
}

function handleSelectionChange(): void {
  try {
    if (editMode.isEnabled()) {
      return;
    }
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
