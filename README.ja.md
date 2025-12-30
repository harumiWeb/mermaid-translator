# Mermaid Translator

<p align="center">
  <img src="/assets/icon_full.png" width="200" alt="中央揃えの画像">
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Vitest](https://github.com/harumiWeb/mermaid-translator/actions/workflows/vitest.yml/badge.svg)](https://github.com/harumiWeb/mermaid-translator/actions/workflows/vitest.yml) [![Oxlint](https://github.com/harumiWeb/mermaid-translator/actions/workflows/oxlint.yml/badge.svg)](https://github.com/harumiWeb/mermaid-translator/actions/workflows/oxlint.yml)

[英語版README](README.md)

> **Select Mermaid text anywhere on the web — render it instantly.**

Web ページ上の Mermaid 記法を **選択してクリックするだけ** で、  
その場に図として表示できる Chrome 拡張機能です。

![動作イメージ](/assets/screenshot.gif)

---

## What is this?

**Mermaid Translator** は、  
Markdown や特定のタグに依存せず、

> **「人が選択した Mermaid テキスト」**

を起点に、図をレンダリングします。

- 自動では何もしません
- ページ構造を解析しません
- ページを壊しません

**必要なときに、必要な分だけ。**

---

## Features

- 選択したテキストから Mermaid ダイアグラムをレンダリング
- 編集モード：より大きなパネルを開き、Mermaid コードを調整し、変更内容をプレビューします

![mermaidコードを選択してプレビュー](/assets/screenshot01.png)

<p>
  <img width="48%" src="/assets/screenshot02.png" alt="編集モード画面">
  <img width="48%" src="/assets/screenshot03.png" alt="コードエディタ">
</p>

---

## How it works

1. Web ページ上の Mermaid 記法テキストを選択
2. 選択範囲の近くに小さなボタンが表示
3. クリックすると、その場で図をレンダリング

> 自動処理は一切ありません。  
> 操作の主導権は常にユーザーにあります。

---

## Works anywhere

- 技術ブログ / ドキュメント
- GitHub Issues / README
- 社内ツール / 社内 Wiki
- HTML 構造が特殊なページ

Markdown のコードブロックや  
`<pre>` / `<code>` タグに **一切依存しません**。

---

## Designed to be unobtrusive

- 自動レンダリングなし
- ページレイアウトを変更しない
- フォーカス・スクロールを奪わない
- 常駐 UI なし

処理に失敗した場合も、  
**「何も起こらないだけ」** です。

---

## Privacy & Security

- 外部通信なし
- データ収集なし
- 解析はすべてローカルで完結

安心して業務・社内環境でも使用できます。

---

## Installation

### Chrome Web Store

（※ 公開後にリンクを追加）

### Local build (for development)

```bash
pnpm install
pnpm build
```

Chrome の拡張機能管理画面で
`dist/` ディレクトリを読み込んでください。

---

## Why this approach?

多くの Mermaid 拡張は、

- ページ全体を解析する
- 特定の構造を前提にする
- 自動で描画してしまう

という設計です。

この拡張は、あえて **真逆** を選びました。

> **DOM ではなく、人の意思を起点にする。**

それが、
最も壊れにくく、最も信頼できると考えています。

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
このソフトウェアは、いかなる保証もなく、「現状のまま」提供されます。

## Philosophy (short)

何も自動的には行わない。
一つのことをしっかりやる。
決して邪魔をしない。

## Development

```bash
pnpm build:dev
```

`build:dev` は開発ログを有効化したビルドを出力します。

## コマンド一覧

```bash
pnpm lint
pnpm lint:types
pnpm test
pnpm format
```

## Documents

- 仕様: `docs/specs/`
- アーキテクチャ: `docs/ARCHITECTURE.md`
- コーディングガイド: `docs/CODING_GUIDELINES.md`
