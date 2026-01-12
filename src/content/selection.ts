/**
 * Screen coordinates used to position UI elements near selections.
 *
 * @remarks
 * Coordinates are clamped to stay within the visible viewport.
 */
export type ButtonPosition = {
  top: number;
  left: number;
};

/**
 * Selection text plus a bounding rectangle when available.
 *
 * @remarks
 * The rect may be null when the selection is not visually measurable.
 */
export type SelectionInfo = {
  text: string;
  rect: DOMRect | null;
};

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

/**
 * Return the current selection text and its bounding rect if available.
 *
 * @returns Selection information or null when no usable selection exists.
 */
export function getSelectionInfo(): SelectionInfo | null {
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

/**
 * Compute the action button position based on the selection rect.
 *
 * @param rect - Bounding rect for the current selection.
 * @returns Button position, or null when no rect is available.
 */
export function getButtonPosition(rect: DOMRect | null): ButtonPosition | null {
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

/**
 * Compute the popup position based on the selection rect.
 *
 * @param rect - Bounding rect for the current selection.
 * @returns Popup position anchored to the selection.
 */
export function getPopupPosition(rect: DOMRect): ButtonPosition {
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
