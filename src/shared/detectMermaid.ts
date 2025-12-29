const mermaidKeywords = [
  'graph',
  'flowchart',
  'sequencediagram',
  'classdiagram',
  'statediagram',
  'erdiagram',
  'gantt',
  'pie',
  'mindmap',
  'timeline',
  'journey',
  'gitGraph',
  'C4Context',
  'requirementDiagram',
  'architecture-beta',
];

export function isMermaidLike(text: string): boolean {
  const lower = text.toLowerCase();
  return mermaidKeywords.some((keyword) => lower.includes(keyword));
}

export function extractMermaidCode(text: string): string {
  const match = text.match(/```mermaid\s*([\s\S]*?)```/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const lineLower = lines[i].toLowerCase();
    if (mermaidKeywords.some((keyword) => lineLower.includes(keyword))) {
      return lines.slice(i).join('\n').trim();
    }
  }

  return text.trim();
}
