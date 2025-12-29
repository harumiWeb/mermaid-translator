import type { Mermaid } from 'mermaid';

let mermaidApi: Mermaid | null = null;

export async function renderMermaid(
  code: string,
  container: HTMLElement
): Promise<string | null> {
  try {
    if (code.trim().length === 0) {
      return null;
    }

    if (!mermaidApi) {
      const mermaidModule = (await import('mermaid')) as { default: Mermaid };
      mermaidApi = mermaidModule.default;
      mermaidApi.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'default',
      });
    }

    const id = `mermaid-${crypto.randomUUID()}`;
    const { svg } = await mermaidApi.render(id, code);

    container.innerHTML = svg;
    return svg;
  } catch {
    return null;
  }
}
