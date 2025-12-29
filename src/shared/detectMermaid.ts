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
];

export function isMermaidLike(text: string): boolean {
  const lower = text.toLowerCase();
  return mermaidKeywords.some((keyword) => lower.includes(keyword));
}
