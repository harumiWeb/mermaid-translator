type RenderCacheInput = {
  lastSvg: string | null;
  lastSource: string | null;
  lastTheme: string | null;
  nextSource: string;
  nextTheme: string;
};

export function isRenderCacheHit(input: RenderCacheInput): boolean {
  if (!input.lastSvg) {
    return false;
  }
  return (
    input.lastSource === input.nextSource && input.lastTheme === input.nextTheme
  );
}
