# 実装タスク

このドキュメントでは、`docs/specs/` 配下の仕様から厳密に派生した、具体的な実装レベルのタスクを定義します。
すべての実装作業は、ここで定義されたタスクに基づいて行う必要があります。

---

## このドキュメントの使い方

- タスクは、コードを記述する前に作成する必要があります。
- 各タスクは、1 つ以上の仕様 ID を参照する必要があります。
- タスクは「どのように実装するか」ではなく「何を実装するか」を記述します。
- 既存仕様から派生できない場合は、停止し、新しい仕様または改訂仕様を提案します。

---

## 記述ルール

- 未完了は `[ ]`、完了は `[x]` で記述します。
- 抽象的なタスクは禁止。具体的タスクを必要に応じてネストで表現します。

### タスクステータスの凡例

- [ ] 未開始
- [~] 進行中
- [x] 完了
- [!] ブロック中（仕様の明確化が必要）

---

## タスク

- [x] 選択テキストの取得と更新を行う処理を追加する（空・空白のみは無視し、前回と異なる場合のみ内部状態を更新する）。`spec: 001-selection-detection`
- [x] 選択取得処理の失敗を握りつぶし、ユーザー体験に影響しないようにする。`spec: 001-selection-detection`
- [x] 開発環境のみで選択テキストを内部ログできるようにする。`spec: 001-selection-detection`

- [ ] Mermaid 判定を行う純粋関数を追加し、選択文字列内に Mermaid 図形キーワードが含まれる場合のみ Mermaid-like と判定する。`spec: 002-action-button-ui`

- [ ] Mermaid らしい選択時のみ表示されるアクションボタン UI を作成する（非選択・非 Mermaid 時は非表示）。`spec: 002-action-button-ui`
- [ ] アクションボタンの表示位置を選択範囲の矩形に基づいて決定できるようにする（選択文字列の上書きや重なりは避ける）。`spec: 002-action-button-ui`
- [ ] ボタン表示・非表示の切り替えが選択変更と同期するようにする。`spec: 002-action-button-ui`
- [ ] ボタンクリックのハンドラを追加し、他の副作用を持たないことを保証する。`spec: 002-action-button-ui`

- [ ] ボタンクリック時に現在の選択テキストを取得し、レンダラーへ渡すトリガー処理を追加する。`spec: 003-mermaid-render-trigger`
- [ ] クリック以外の経路でレンダリングが起きないことを担保する。`spec: 003-mermaid-render-trigger`

- [ ] レンダー結果を表示する拡張機能専用ポップアップコンテナをオンデマンドで作成する。`spec: 004-popup-lifecycle`
- [ ] ポップアップを Shadow DOM 内に描画し、ホストページのスタイルに影響しないことを担保する。`spec: 004-popup-lifecycle`
- [ ] ポップアップを以下の条件で確実に破棄する：選択解除、選択変更、ポップアップ外クリック、ページ遷移/再読み込み。`spec: 004-popup-lifecycle`
- [ ] ポップアップ破棄処理を複数回呼べる安全な実装にする。`spec: 004-popup-lifecycle`

- [ ] Mermaid テキストを SVG へレンダリングし、拡張機能のコンテナ内に表示する処理を追加する。`spec: 005-mermaid-render`
- [ ] 初回レンダリング時のみ Mermaid ライブラリを遅延読み込みする。`spec: 005-mermaid-render`
- [ ] 不正な Mermaid コードの場合は表示を行わず静かに失敗する。`spec: 005-mermaid-render`
- [ ] レンダリング処理中のエラーを外部に漏らさず、ユーザーに影響しないことを担保する。`spec: 005-mermaid-render`

- [x] ビルド時に `manifest.json` を `dist/manifest.json` に出力する。`spec: 006-build-output`
- [x] ビルド時に `src/content/style.css` を `dist/content/style.css` に出力する。`spec: 006-build-output`
- [x] ビルド時にコンテンツスクリプトを `dist/content/main.js` に出力する。`spec: 006-build-output`

- [x] ビルド時フラグで production でもログを出せるようにする。`spec: 007-dev-logging-flag`
- [x] フラグ未指定時は production でログが出ないことを担保する。`spec: 007-dev-logging-flag`

- [x] `cross-env` を使った `build:dev` スクリプトを追加する。`spec: 008-dev-build-script`

- [x] `oxlint-tsgolint` を devDependencies に追加する。`spec: 009-oxlint-tsgolint`

- [x] `tsconfig.json` の include を明示的な globs に更新する。`spec: 010-tsconfig-include-globs`

- [x] 型解決用に `tsconfig.lint.json` を追加し、lint スクリプトから参照する。`spec: 011-lint-tsconfig`

- [x] `lint` を oxlint（非 type-aware）に変更する。`spec: 012-lint-split`
- [x] `lint:types` を追加し、tsgolint を `tsconfig.lint.json` で実行する。`spec: 012-lint-split`

- [x] `import.meta.env` の型定義を追加する。`spec: 013-vite-env-types`

- [x] 空ファイルとして扱われないよう `src/shared/detectMermaid.ts` と `src/content/ui.tsx` を非空モジュールにする。`spec: 014-lint-cleanup`
- [x] `import()` 型注釈を type-only import に置き換える。`spec: 014-lint-cleanup`
- [x] `if` の単文 return をブロック形式に直す。`spec: 014-lint-cleanup`
