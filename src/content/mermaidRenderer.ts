let mermaidApi: typeof import("mermaid") | null = null

export async function renderMermaid(
  code: string,
  container: HTMLElement
): Promise<void> {
  try {
    if (!mermaidApi) {
      mermaidApi = await import("mermaid")
      mermaidApi.default.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "default"
      })
    }

    const id = `mermaid-${crypto.randomUUID()}`
    const { svg } = await mermaidApi.default.render(id, code)

    container.innerHTML = svg
  } catch {
    // fail silently (AGENTS.md 準拠)
  }
}
