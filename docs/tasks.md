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

- [x] Mermaid 判定を行う純粋関数を追加し、選択文字列内に Mermaid 図形キーワードが含まれる場合のみ Mermaid-like と判定する。`spec: 002-action-button-ui`

- [x] Mermaid らしい選択時のみ表示されるアクションボタン UI を作成する（非選択・非 Mermaid 時は非表示）。`spec: 002-action-button-ui`
- [x] アクションボタンの表示位置を選択範囲の矩形に基づいて決定できるようにする（選択文字列の上書きや重なりは避ける）。`spec: 002-action-button-ui`
- [x] ボタン表示・非表示の切り替えが選択変更と同期するようにする。`spec: 002-action-button-ui`
- [x] ボタンクリックのハンドラを追加し、他の副作用を持たないことを保証する。`spec: 002-action-button-ui`
- [x] アクションボタンに `public/mermaid-icon.svg` を表示する。`spec: 002-action-button-ui`
- [x] `mermaid-icon.svg` を web accessible resources に追加する。`spec: 002-action-button-ui`

- [x] ボタンクリック時に現在の選択テキストを取得し、レンダラーへ渡すトリガー処理を追加する。`spec: 003-mermaid-render-trigger`
- [x] クリック以外の経路でレンダリングが起きないことを担保する。`spec: 003-mermaid-render-trigger`

- [x] レンダー結果を表示する拡張機能専用ポップアップコンテナをオンデマンドで作成する。`spec: 004-popup-lifecycle`
- [x] ポップアップを Shadow DOM 内に描画し、ホストページのスタイルに影響しないことを担保する。`spec: 004-popup-lifecycle`
- [x] ポップアップを以下の条件で確実に破棄する：選択解除、選択変更、ポップアップ外クリック、ページ遷移/再読み込み。`spec: 004-popup-lifecycle`
- [x] ポップアップ破棄処理を複数回呼べる安全な実装にする。`spec: 004-popup-lifecycle`
- [x] ポップアップの最小幅を 550px、最大幅をウィンドウ幅の 50% に設定する。`spec: 004-popup-lifecycle`
- [x] ポップアップ右上に閉じるボタンを追加する。`spec: 004-popup-lifecycle`
- [x] 閉じるボタンにツールチップを付ける。`spec: 004-popup-lifecycle`

- [x] Mermaid テキストを SVG へレンダリングし、拡張機能のコンテナ内に表示する処理を追加する。`spec: 005-mermaid-render`
- [x] 初回レンダリング時のみ Mermaid ライブラリを遅延読み込みする。`spec: 005-mermaid-render`
- [x] 選択文字列から Mermaid コードブロックがあれば抽出する。`spec: 005-mermaid-render`
- [x] 不正な Mermaid コードの場合はポップアップ内にエラーメッセージを表示する。`spec: 005-mermaid-render`
- [x] Mermaid キーワードが出現する行以前のテキストを破棄する。`spec: 005-mermaid-render`

- [x] `dist/content/main.js` を UTF-8 (BOMなし) に正規化する。`spec: 007-output-encoding`
- [x] `dist/content/main.js` が ASCII 互換になるようにビルド出力を調整する。`spec: 007-output-encoding`

- [x] 再利用可能なツールチップUIを追加する（矢印とアニメーションを含む）。`spec: 006-tooltip-ui`
- [x] アクションボタンにツールチップ「View Mermaid diagram」を表示する。`spec: 006-tooltip-ui`
