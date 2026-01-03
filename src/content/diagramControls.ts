type DiagramControlsElements = {
  content: HTMLElement;
  diagram: HTMLElement;
  zoomControls: HTMLElement;
  zoomInButton: HTMLButtonElement;
  zoomOutButton: HTMLButtonElement;
  copyButton: HTMLButtonElement;
  copyTooltip: HTMLElement;
};

type PanState = {
  pointerId: number;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
};

export type DiagramControls = {
  setElements: (elements: DiagramControlsElements | null) => void;
  setEditModeEnabled: (enabled: boolean) => void;
  setActiveTab: (tab: 'view' | 'editor') => void;
  setSourceText: (text: string | null) => void;
  setEditorText: (text: string | null) => void;
  updateCopyLayout: () => void;
  updateCopyTheme: (theme: 'light' | 'dark') => void;
  updateZoomTheme: (theme: 'light' | 'dark') => void;
  resetPanZoom: () => void;
  zoomBy: (delta: number) => void;
  startPan: (event: PointerEvent) => void;
  handleCopyEnter: () => void;
  handleCopyLeave: () => void;
  handleCopyClick: () => void;
  cleanup: () => void;
};

const zoomMin = 0.5;
const zoomMax = 2.0;
const zoomStep = 0.1;

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function createDiagramControls(): DiagramControls {
  let elements: DiagramControlsElements | null = null;
  let panX = 0;
  let panY = 0;
  let zoom = 1;
  let panState: PanState | null = null;
  let editModeEnabled = false;
  let activeTab: 'view' | 'editor' = 'view';
  let sourceText: string | null = null;
  let editorText: string | null = null;
  let copyTooltipTimeout: number | null = null;
  let wheelHandler: ((event: WheelEvent) => void) | null = null;

  const applyPanZoom = () => {
    if (!elements) {
      return;
    }
    elements.diagram.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  };

  const updateZoomButtons = () => {
    if (!elements) {
      return;
    }

    const canZoomIn = zoom < zoomMax;
    const canZoomOut = zoom > zoomMin;

    elements.zoomInButton.disabled = !canZoomIn;
    elements.zoomOutButton.disabled = !canZoomOut;
    elements.zoomInButton.style.opacity = canZoomIn ? '1' : '0.5';
    elements.zoomOutButton.style.opacity = canZoomOut ? '1' : '0.5';
  };

  const setCopyTooltip = (text: string, visible: boolean) => {
    if (!elements) {
      return;
    }
    elements.copyTooltip.textContent = text;
    elements.copyTooltip.classList.toggle('is-visible', visible);
  };

  const triggerCopyFeedback = () => {
    if (!elements) {
      return;
    }

    if (copyTooltipTimeout !== null) {
      window.clearTimeout(copyTooltipTimeout);
    }

    elements.copyButton.style.transform = 'scale(0.92)';
    window.setTimeout(() => {
      if (elements) {
        elements.copyButton.style.transform = 'scale(1)';
      }
    }, 120);

    setCopyTooltip('Copied', true);
    copyTooltipTimeout = window.setTimeout(() => {
      setCopyTooltip('Copy Mermaid code', false);
      copyTooltipTimeout = null;
    }, 900);
  };

  const updateCopyState = () => {
    if (!elements) {
      return;
    }

    if (!editModeEnabled) {
      elements.copyButton.disabled = true;
      elements.copyButton.style.opacity = '0.5';
      setCopyTooltip('Copy Mermaid code', false);
      return;
    }

    const text =
      activeTab === 'editor' ? (editorText ?? '') : (sourceText ?? '');
    const enabled = text.trim().length > 0;
    elements.copyButton.disabled = !enabled;
    elements.copyButton.style.opacity = enabled ? '1' : '0.5';
    if (!enabled) {
      setCopyTooltip('Copy Mermaid code', false);
    }
  };

  const stopPan = () => {
    if (!panState) {
      return;
    }

    window.removeEventListener('pointermove', handlePanMove);
    panState = null;
    if (elements) {
      elements.content.style.cursor = 'grab';
    }
  };

  const handlePanMove = (event: PointerEvent) => {
    if (!panState) {
      return;
    }

    if (event.pointerId !== panState.pointerId) {
      return;
    }

    panX = panState.startPanX + (event.clientX - panState.startX);
    panY = panState.startPanY + (event.clientY - panState.startY);
    applyPanZoom();
  };

  return {
    setElements(next) {
      if (elements && wheelHandler) {
        elements.content.removeEventListener('wheel', wheelHandler);
        wheelHandler = null;
      }
      elements = next;
      if (elements) {
        wheelHandler = (event: WheelEvent) => {
          if (!event.ctrlKey) {
            return;
          }
          event.preventDefault();
          if (event.deltaY === 0) {
            return;
          }
          const direction = event.deltaY > 0 ? -1 : 1;
          zoom = clampValue(zoom + zoomStep * direction, zoomMin, zoomMax);
          applyPanZoom();
          updateZoomButtons();
        };
        elements.content.addEventListener('wheel', wheelHandler, {
          passive: false,
        });
      }
      updateZoomButtons();
      updateCopyState();
    },
    setEditModeEnabled(enabled) {
      editModeEnabled = enabled;
      updateCopyState();
      if (!elements) {
        return;
      }
      elements.copyButton.style.display = enabled ? 'inline-flex' : 'none';
    },
    setActiveTab(tab) {
      activeTab = tab;
      updateCopyState();
    },
    setSourceText(text) {
      sourceText = text;
      updateCopyState();
    },
    setEditorText(text) {
      editorText = text;
      updateCopyState();
    },
    updateCopyLayout() {
      if (!elements) {
        return;
      }
      const topOffset = editModeEnabled ? 12 : 8;
      elements.copyButton.style.top = `${topOffset}px`;
      elements.copyTooltip.style.top = `${topOffset}px`;
    },
    updateCopyTheme(_theme) {
      // handled by CSS variables on the popup root
    },
    updateZoomTheme(_theme) {
      // handled by CSS variables on the popup root
    },
    resetPanZoom() {
      panX = 0;
      panY = 0;
      zoom = 1;
      applyPanZoom();
      updateZoomButtons();
    },
    zoomBy(delta) {
      zoom = clampValue(zoom + delta, zoomMin, zoomMax);
      applyPanZoom();
      updateZoomButtons();
    },
    startPan(event) {
      if (!elements) {
        return;
      }
      if (event.button !== 0) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest('[data-zoom-control="true"]') ||
          target.closest('[data-pan-ignore="true"]'))
      ) {
        return;
      }

      event.preventDefault();
      elements.content.style.cursor = 'grabbing';
      panState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startPanX: panX,
        startPanY: panY,
      };
      window.addEventListener('pointermove', handlePanMove);
      window.addEventListener(
        'pointerup',
        () => {
          stopPan();
        },
        { once: true }
      );
    },
    handleCopyEnter() {
      setCopyTooltip('Copy Mermaid code', true);
    },
    handleCopyLeave() {
      setCopyTooltip('Copy Mermaid code', false);
    },
    handleCopyClick() {
      void (async () => {
        const text =
          activeTab === 'editor' ? (editorText ?? '') : (sourceText ?? '');
        if (text.trim().length === 0) {
          return;
        }
        try {
          await navigator.clipboard.writeText(text);
          triggerCopyFeedback();
        } catch {
          // ignore
        }
      })();
    },
    cleanup() {
      stopPan();
      if (elements && wheelHandler) {
        elements.content.removeEventListener('wheel', wheelHandler);
        wheelHandler = null;
      }
      if (copyTooltipTimeout !== null) {
        window.clearTimeout(copyTooltipTimeout);
        copyTooltipTimeout = null;
      }
      elements = null;
    },
  };
}
