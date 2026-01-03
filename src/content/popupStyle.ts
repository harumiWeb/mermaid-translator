export const popupStyle = `
:host {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2147483647;
}

.mr-theme {
  --popup-bg: #fff;
  --popup-text: #111;
  --popup-border: #222;
  --popup-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  --popup-muted: #555;
  --popup-button-bg: #fff;
  --popup-button-text: #111;
  --popup-button-border: #222;
  --popup-icon-filter: none;
  --popup-tab-active-bg: #fff;
  --popup-tab-inactive-bg: #f2f2f2;
  --popup-tab-active-text: #111;
  --popup-tab-inactive-text: #333;
  --popup-input-bg: #fff;
  --popup-input-text: #111;
  --popup-input-border: #222;
  --spinner-border: #c7c7c7;
  --spinner-top: #555;
}

.mr-theme[data-theme='dark'] {
  --popup-bg: #1c1c1c;
  --popup-text: #f2f2f2;
  --popup-border: #3a3a3a;
  --popup-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  --popup-muted: #cfcfcf;
  --popup-button-bg: #2a2a2a;
  --popup-button-text: #f2f2f2;
  --popup-button-border: #3a3a3a;
  --popup-icon-filter: invert(1);
  --popup-tab-active-bg: #2a2a2a;
  --popup-tab-inactive-bg: #242424;
  --popup-tab-active-text: #f2f2f2;
  --popup-tab-inactive-text: #cfcfcf;
  --popup-input-bg: #151515;
  --popup-input-text: #f2f2f2;
  --popup-input-border: #3a3a3a;
  --spinner-border: #555;
  --spinner-top: #cfcfcf;
}

@keyframes mermaid-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.mr-action-wrapper {
  position: fixed;
  z-index: 2147483647;
}

.mr-action-button {
  width: 35px;
  height: 35px;
  border-radius: 6px;
  border: 1px solid #222;
  background: #fff;
  color: #111;
  font-size: 12px;
  line-height: 26px;
  text-align: center;
  padding: 0;
  cursor: pointer;
  user-select: none;
}

.mr-action-icon {
  display: block;
  width: 22px;
  height: 22px;
  margin: 0 auto;
}

.mr-tooltip {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translate(-50%, 4px);
  opacity: 0;
  transition: opacity 140ms ease, transform 140ms ease;
  padding: 6px 8px;
  border-radius: 6px;
  background: #111;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 2147483647;
}

.mr-tooltip.is-visible {
  opacity: 1;
  transform: translate(-50%, 0);
}

.mr-tooltip-arrow {
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  transform: translateX(-50%) rotate(45deg);
  background: #111;
}

.mr-popup {
  position: fixed;
  background: var(--popup-bg);
  color: var(--popup-text);
  border: 1px solid var(--popup-border);
  border-radius: 8px;
  box-shadow: var(--popup-shadow);
  padding: 12px 12px 10px;
  z-index: 2147483647;
}

.mr-popup-arrow {
  position: absolute;
  top: -6px;
  left: 16px;
  width: 10px;
  height: 10px;
  background: var(--popup-bg);
  border-left: 1px solid var(--popup-border);
  border-top: 1px solid var(--popup-border);
  transform: rotate(45deg);
}

.mr-popup-header {
  padding-top: 4px;
  display: flex;
  align-items: center;
}

.mr-popup-actions {
  flex: 1;
}

.mr-tab-bar {
  display: none;
  gap: 6px;
  margin-top: 8px;
}

.mr-tab {
  height: 28px;
  flex: 1;
  border: 1px solid var(--popup-border);
  border-radius: 6px;
  background: var(--popup-tab-inactive-bg);
  color: var(--popup-tab-inactive-text);
  cursor: pointer;
  font-size: 12px;
}

.mr-tab.is-active {
  background: var(--popup-tab-active-bg);
  color: var(--popup-tab-active-text);
}

.mr-popup-message {
  margin-top: 8px;
  font-size: 12px;
  color: #b00020;
  display: none;
}

.mr-popup-loading {
  margin-top: 8px;
  display: none;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--popup-muted);
}

.mr-spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid var(--spinner-border);
  border-top-color: var(--spinner-top);
  animation: mermaid-spin 0.9s linear infinite;
}

.mr-popup-content-wrapper {
  position: relative;
}

.mr-popup-content {
  overflow: hidden;
  padding-top: 8px;
  position: relative;
  cursor: grab;
  z-index: 0;
}

.mr-popup-diagram {
  transform-origin: 0 0;
  will-change: transform;
}

.mr-button-reset {
  padding: 0;
  border: 1px solid var(--popup-button-border);
  background: var(--popup-button-bg);
  color: var(--popup-button-text);
}

.mr-floating-button {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease;
  z-index: 2;
}

.mr-floating-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mr-floating-icon {
  width: 14px;
  height: 14px;
  filter: var(--popup-icon-filter);
}

.mr-floating-tooltip {
  position: absolute;
  transform: translate(0, calc(-100% - 2px));
  opacity: 0;
  transition: opacity 140ms ease, transform 140ms ease;
  padding: 6px 8px;
  border-radius: 6px;
  background: #111;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 3;
}

.mr-floating-tooltip.is-visible {
  opacity: 1;
  transform: translate(0, calc(-100% - 6px));
}

.mr-copy-button {
  right: 8px;
}

.mr-copy-tooltip {
  right: 8px;
}

.mr-split-button {
  right: 42px;
}

.mr-split-tooltip {
  right: 42px;
}

.mr-zoom-controls {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.mr-zoom-button {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--popup-button-border);
  background: var(--popup-button-bg);
  color: var(--popup-button-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mr-zoom-icon {
  width: 14px;
  height: 14px;
  filter: var(--popup-icon-filter);
}

.mr-editor-panel {
  display: none;
  padding-top: 8px;
}

.mr-editor-textarea {
  width: 100%;
  resize: none;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid var(--popup-input-border);
  background: var(--popup-input-bg);
  color: var(--popup-input-text);
}

.mr-resize-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  right: 6px;
  bottom: 6px;
  cursor: nwse-resize;
  display: none;
}

.mr-resize-handle.is-visible {
  display: block;
}

.mr-popup-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mr-popup-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mr-popup-actions-theme-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mr-popup-actions-select {
  height: 28px;
  border: 1px solid var(--popup-button-border);
  border-radius: 6px;
  background: var(--popup-button-bg);
  color: var(--popup-button-text);
  font-size: 12px;
  padding: 0 8px;
}

.mr-popup-actions-icon {
  display: block;
  width: 14px;
  height: 14px;
  filter: var(--popup-icon-filter);
}

.mr-popup-actions-app-icon {
  display: block;
  width: 18px;
  height: 18px;
}

.mr-tooltip-button-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mr-tooltip-button {
  height: 28px;
  border: 1px solid var(--popup-button-border);
  border-radius: 6px;
  background: var(--popup-button-bg);
  color: var(--popup-button-text);
  font-size: 12px;
  cursor: pointer;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.mr-tooltip-button.is-icon {
  padding: 0 6px;
}

.mr-tooltip-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mr-theme-select-wrapper {
  position: relative;
  display: inline-flex;
}

.mr-editor-popup {
  position: fixed;
  z-index: 2147483647;
  border-radius: 8px;
  padding: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--popup-bg);
  color: var(--popup-text);
  border: 1px solid var(--popup-border);
  box-shadow: var(--popup-shadow);
}

.mr-editor-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
}

.mr-editor-popup-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mr-editor-popup-title {
  font-size: 12px;
  font-weight: 600;
}

.mr-editor-popup-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid var(--popup-button-border);
  background: var(--popup-button-bg);
  color: var(--popup-button-text);
}

.mr-editor-popup-close-icon {
  width: 14px;
  height: 14px;
  filter: var(--popup-icon-filter);
}

.mr-editor-popup-content {
  flex: 1;
  min-height: 0;
}
`;

const styleMarker = 'data-mermaid-popup-style';

export function ensurePopupStyle(shadowRoot: ShadowRoot): void {
  try {
    if (shadowRoot.querySelector(`style[${styleMarker}]`)) {
      return;
    }

    const style = document.createElement('style');
    style.setAttribute(styleMarker, 'true');
    style.textContent = popupStyle;
    shadowRoot.appendChild(style);
  } catch {
    // ignore
  }
}
