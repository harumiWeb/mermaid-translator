import { describe, expect, it } from 'vitest';
import { isRenderCacheHit } from './renderCache';

describe('isRenderCacheHit', () => {
  it('returns true when svg/source/theme match', () => {
    expect(
      isRenderCacheHit({
        lastSvg: '<svg />',
        lastSource: 'graph TD',
        lastTheme: 'default',
        nextSource: 'graph TD',
        nextTheme: 'default',
      })
    ).toBe(true);
  });

  it('returns false when svg is missing', () => {
    expect(
      isRenderCacheHit({
        lastSvg: null,
        lastSource: 'graph TD',
        lastTheme: 'default',
        nextSource: 'graph TD',
        nextTheme: 'default',
      })
    ).toBe(false);
  });

  it('returns false when source changes', () => {
    expect(
      isRenderCacheHit({
        lastSvg: '<svg />',
        lastSource: 'graph TD',
        lastTheme: 'default',
        nextSource: 'sequenceDiagram',
        nextTheme: 'default',
      })
    ).toBe(false);
  });

  it('returns false when theme changes', () => {
    expect(
      isRenderCacheHit({
        lastSvg: '<svg />',
        lastSource: 'graph TD',
        lastTheme: 'default',
        nextSource: 'graph TD',
        nextTheme: 'dark',
      })
    ).toBe(false);
  });
});
