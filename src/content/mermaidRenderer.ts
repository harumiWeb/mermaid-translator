import type { Mermaid } from 'mermaid';

let mermaidApi: Mermaid | null = null;

export async function renderMermaid(
  code: string,
  container: HTMLElement
): Promise<void> {
  try {
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
  } catch {
    // fail silently (AGENTS.md 準拠)
  }
}
