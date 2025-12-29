import { describe, expect, it } from 'vitest';
import { extractMermaidCode, isMermaidLike } from './detectMermaid';

describe('isMermaidLike', () => {
  it('detects Mermaid keywords in text', () => {
    expect(isMermaidLike('flowchart TD')).toBe(true);
    expect(isMermaidLike('sequenceDiagram')).toBe(true);
    expect(isMermaidLike('graph LR')).toBe(true);
  });

  it('returns false for non-Mermaid text', () => {
    expect(isMermaidLike('hello world')).toBe(false);
    expect(isMermaidLike('plain text only')).toBe(false);
  });
});

describe('extractMermaidCode', () => {
  it('extracts fenced mermaid code blocks', () => {
    const input = [
      'before',
      '```mermaid',
      'flowchart TD',
      '  A --> B',
      '```',
      'after',
    ].join('\n');
    expect(extractMermaidCode(input)).toBe('flowchart TD\n  A --> B');
  });

  it('extracts from the first Mermaid keyword line when unfenced', () => {
    const input = ['not related', 'flowchart TD', '  A --> B'].join('\n');
    expect(extractMermaidCode(input)).toBe('flowchart TD\n  A --> B');
  });

  it('returns trimmed input when nothing matches', () => {
    expect(extractMermaidCode('  hello  ')).toBe('hello');
  });
});
