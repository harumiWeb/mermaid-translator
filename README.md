# Mermaid Translator

<p align="center">
  <img src="/assets/icon_full.png" width="200" alt="Centered illustration">
</p>

![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/nnpefgjibopfpcplldjaoniokpdcefjk) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Vitest](https://github.com/harumiWeb/mermaid-translator/actions/workflows/vitest.yml/badge.svg)](https://github.com/harumiWeb/mermaid-translator/actions/workflows/vitest.yml) [![Codacy Badge](https://app.codacy.com/project/badge/Grade/fe084998551b4d978da692e28c818c06)](https://app.codacy.com/gh/harumiWeb/mermaid-translator/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

[日本版 README](README.ja.md)

> **Select Mermaid text anywhere on the web and render it instantly.**

Mermaid Translator is a Chrome extension that lets you select Mermaid syntax
on any web page and render it on the spot.

![demo](/assets/screenshot.gif)

---

## What is this?

**Mermaid Translator** renders diagrams based on what a person selects, not on
Markdown structure or specific tags.

- No automatic actions
- No page structure assumptions
- No page breakage

**Only when you need it, and only as much as you need.**

---

## Features

- Render Mermaid diagrams from selected text
- Save Mermaid diagrams in SVG/PNG format
- Edit mode: open a larger panel, tweak Mermaid code, and preview changes
  - The window can be freely dragged and resized without interfering with existing pages.

![Select Mermaid code and preview](/assets/screenshot01.png)

<p>
  <img width="48%" src="/assets/screenshot02.png" alt="Edit mode panel">
  <img width="48%" src="/assets/screenshot03.png" alt="Code editor view">
</p>

---

## How it works

1. Select Mermaid text on a web page
2. A small button appears near your selection
3. Click the button to render the diagram

> Nothing happens automatically.
> You are always in control.

---

## Works anywhere

- Technical blogs and documentation
- GitHub Issues and README pages
- Internal tools and company wikis
- Pages with unusual HTML structures

It does **not** rely on Markdown code blocks or `<pre>` / `<code>` tags.

---

## Designed to be unobtrusive

- No automatic rendering
- No page layout changes
- No focus or scroll hijacking
- No persistent UI

If something fails, it simply does nothing.

---

## Privacy & Security

- No external network requests
- No data collection
- All processing happens locally

Safe for internal or corporate usage.

---

## Installation

### Chrome Web Store

[Mermaid Translator (Chrome Web Store)](https://img.shields.io/chrome-web-store/v/nnpefgjibopfpcplldjaoniokpdcefjk)

### Local build (for development)

```bash
pnpm install
pnpm build
```

Load the `dist/` directory from Chrome's extensions page.

---

## Why this approach?

Many Mermaid extensions:

- Scan the entire page
- Assume a specific structure
- Auto-render without user intent

This extension intentionally chooses the opposite.

> **Not DOM-driven, but user-driven.**

This makes it more reliable and trustworthy.

---

## Tech Stack

- TypeScript
- Vite
- Chrome Extension (Manifest V3)
- Preact
- Mermaid

---

## License

MIT License
Provided "as is" without warranty of any kind.

## Philosophy (short)

Do nothing automatically.
Do one thing well.
Never get in the way.

## Development

```bash
pnpm build:dev
```

`build:dev` outputs a build with developer logging enabled.

## Commands

```bash
pnpm lint
pnpm lint:types
pnpm test
pnpm format
```

## Documents

- Specs: `docs/specs/`
- Architecture: `docs/ARCHITECTURE.md`
- Coding Guidelines: `docs/CODING_GUIDELINES.md`
