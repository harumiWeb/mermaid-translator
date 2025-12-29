# Mermaid Translator

選択した Mermaid コードを、クリック操作で安全にレンダリングできる
Chrome 拡張機能（Manifest V3）です。

## 特長

- テキスト選択 → ボタンクリックの明示操作のみで描画
- 任意ページ対応（DOM 構造やタグに依存しない）
- Shadow DOM で UI を隔離、ページを汚さない
- SVG / PNG 保存、新規タブでの SVG 表示
- Mermaid テーマ選択 + ポップアップのライト/ダーク切替
- 失敗時は静かにフェイル（ページ動作を妨げない）

## 使い方

1. Mermaid コードを選択
2. 選択付近に出るボタンをクリック
3. ポップアップ内で表示・保存・新規タブ表示を実行

## ビルドと読み込み

```bash
pnpm install
pnpm build
```

Chrome で `chrome://extensions` を開き、
「デベロッパーモード」を ON → 「パッケージ化されていない拡張機能を読み込む」で `dist` を指定します。

## 開発

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

## ドキュメント

- 仕様: `docs/specs/`
- アーキテクチャ: `docs/ARCHITECTURE.md`
- コーディングガイド: `docs/CODING_GUIDELINES.md`
