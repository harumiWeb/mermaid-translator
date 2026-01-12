import DOMPurify from 'dompurify';
import type { Mermaid } from 'mermaid';

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base';

let mermaidApi: Mermaid | null = null;
let lastTheme: MermaidTheme | null = null;
const isDebug =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true';

/**
 * Render Mermaid source into the provided container and return the SVG element.
 *
 * @param code - Mermaid source text to render.
 * @param container - Target element where the SVG is inserted.
 * @param theme - Mermaid theme name used for rendering.
 * @returns Rendered SVG element, or null when rendering fails.
 * @remarks
 * This function loads Mermaid lazily on first use and sanitizes SVG output.
 */
export async function renderMermaid(
  code: string,
  container: HTMLElement,
  theme: MermaidTheme
): Promise<SVGElement | null> {
  try {
    if (code.trim().length === 0) {
      return null;
    }

    const renderStart = performance.now();
    if (!mermaidApi) {
      const loadStart = performance.now();
      const mermaidModule = (await import('mermaid')) as { default: Mermaid };
      mermaidApi = mermaidModule.default;
      if (isDebug) {
        console.warn(
          '[mermaid-render] load mermaid',
          Math.round(performance.now() - loadStart),
          'ms'
        );
      }
    }

    if (!lastTheme || lastTheme !== theme) {
      const initStart = performance.now();
      mermaidApi.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme,
        legacyMathML: true,
        forceLegacyMathML: true,
        suppressErrorRendering: true,
      });
      lastTheme = theme;
      if (isDebug) {
        console.warn(
          '[mermaid-render] init mermaid',
          Math.round(performance.now() - initStart),
          'ms'
        );
      }
    }

    const id = `mermaid-${crypto.randomUUID()}`;
    const renderSvgStart = performance.now();
    const { svg } = await mermaidApi.render(id, code);
    if (isDebug) {
      console.warn(
        '[mermaid-render] render svg',
        Math.round(performance.now() - renderSvgStart),
        'ms'
      );
    }
    const sanitizeStart = performance.now();
    const sanitizedFragment = DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['style', 'foreignObject', 'div', 'span', 'p', 'br'],
      ADD_ATTR: ['style', 'class', 'xmlns', 'xmlns:xlink'],
      RETURN_DOM_FRAGMENT: true,
    });
    if (isDebug) {
      console.warn(
        '[mermaid-render] sanitize svg',
        Math.round(performance.now() - sanitizeStart),
        'ms'
      );
    }

    const svgElement = sanitizedFragment.querySelector('svg');
    if (!(svgElement instanceof SVGElement)) {
      return null;
    }

    const insertStart = performance.now();
    container.replaceChildren(svgElement);
    if (isDebug) {
      console.warn(
        '[mermaid-render] insert svg',
        Math.round(performance.now() - insertStart),
        'ms'
      );
      console.warn(
        '[mermaid-render] total',
        Math.round(performance.now() - renderStart),
        'ms'
      );
    }
    return svgElement;
  } catch {
    return null;
  }
}
