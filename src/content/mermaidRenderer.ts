import DOMPurify from 'dompurify';
import type { Mermaid } from 'mermaid';

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base';

let mermaidApi: Mermaid | null = null;
let lastTheme: MermaidTheme | null = null;

export async function renderMermaid(
  code: string,
  container: HTMLElement,
  theme: MermaidTheme
): Promise<string | null> {
  try {
    if (code.trim().length === 0) {
      return null;
    }

    if (!mermaidApi) {
      const mermaidModule = (await import('mermaid')) as { default: Mermaid };
      mermaidApi = mermaidModule.default;
    }

    if (!lastTheme || lastTheme !== theme) {
      mermaidApi.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme,
        legacyMathML: true,
        forceLegacyMathML: true,
        suppressErrorRendering: true,
      });
      lastTheme = theme;
    }

    const id = `mermaid-${crypto.randomUUID()}`;
    const { svg } = await mermaidApi.render(id, code);
    const sanitizedFragment = DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ['style', 'foreignObject', 'div', 'span', 'p', 'br'],
      ADD_ATTR: ['style', 'class', 'xmlns', 'xmlns:xlink'],
      RETURN_DOM_FRAGMENT: true,
    });

    const svgElement = sanitizedFragment.querySelector('svg');
    if (!(svgElement instanceof SVGElement)) {
      return null;
    }

    container.replaceChildren(svgElement);
    return svgElement.outerHTML;
  } catch {
    return null;
  }
}
