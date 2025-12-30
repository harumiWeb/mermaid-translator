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
- [x] input/textarea の選択文字列も取得できるようにする。`spec: 001-selection-detection`

- [x] Mermaid 判定を行う純粋関数を追加し、選択文字列内に Mermaid 図形キーワードが含まれる場合のみ Mermaid-like と判定する。`spec: 002-action-button-ui`

- [x] Mermaid らしい選択時のみ表示されるアクションボタン UI を作成する（非選択・非 Mermaid 時は非表示）。`spec: 002-action-button-ui`
- [x] アクションボタンの表示位置を選択範囲の矩形に基づいて決定できるようにする（選択文字列の上書きや重なりは避ける）。`spec: 002-action-button-ui`
- [x] input/textarea 選択時はアクティブ要素の矩形でボタン位置を決定する。`spec: 002-action-button-ui`
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
- [x] ポップアップが画面外に出ないように位置を補正する。`spec: 004-popup-lifecycle`
- [x] 閉じるボタンをアクションバー内に移し、右寄せ配置にする。`spec: 004-popup-lifecycle`
- [x] ポップアップ上部のボタン群の高さを統一する。`spec: 004-popup-lifecycle`
- [x] 閉じるボタンのアイコンに `public/close.svg` を使用する。`spec: 004-popup-lifecycle`
- [x] ポップアップの配色をシステム設定に合わせて切り替える。`spec: 004-popup-lifecycle`
- [x] ポップアップのテーマ切り替えボタンを追加し、設定を保存する。`spec: 004-popup-lifecycle`

- [x] Mermaid テキストを SVG へレンダリングし、拡張機能のコンテナ内に表示する処理を追加する。`spec: 005-mermaid-render`
- [x] 初回レンダリング時のみ Mermaid ライブラリを遅延読み込みする。`spec: 005-mermaid-render`
- [x] 選択文字列から Mermaid コードブロックがあれば抽出する。`spec: 005-mermaid-render`
- [x] 不正な Mermaid コードの場合はポップアップ内にエラーメッセージを表示する。`spec: 005-mermaid-render`
- [x] Mermaid キーワードが出現する行以前のテキストを破棄する。`spec: 005-mermaid-render`
- [x] Mermaid レンダリング時のみ KaTeX quirks mode 警告を抑制する。`spec: 005-mermaid-render`
- [x] Mermaid 由来の KaTeX quirks mode 警告を常に抑制する。`spec: 005-mermaid-render`
- [x] Mermaid のエラーDOM自動挿入を抑止する。`spec: 005-mermaid-render`

- [x] `dist/content/main.js` を UTF-8 (BOMなし) に正規化する。`spec: 007-output-encoding`
- [x] `dist/content/main.js` が ASCII 互換になるようにビルド出力を調整する。`spec: 007-output-encoding`

- [x] 再利用可能なツールチップUIを追加する（矢印とアニメーションを含む）。`spec: 006-tooltip-ui`
- [x] アクションボタンにツールチップ「View Mermaid diagram」を表示する。`spec: 006-tooltip-ui`
- [x] ポップアップのアクションボタンにもツールチップを適用する。`spec: 006-tooltip-ui`

- [x] システム配色に応じたテーマ解決を追加する。`spec: 011-theme-selection`
- [x] ポップアップにテーマ選択ドロップダウンを追加する。`spec: 011-theme-selection`
- [x] テーマ選択を `localStorage` に保存・復元する。`spec: 011-theme-selection`
- [x] テーマ変更時にポップアップ内の図を再レンダリングする。`spec: 011-theme-selection`

- [x] `detectMermaid` のユニットテストを追加する。`spec: 012-tests-detect-mermaid`
- [x] ポップアップ内に SVG/PNG の保存アクションを追加する。`spec: 009-export-rendered-image`
- [x] SVG をそのままダウンロードできるようにする。`spec: 009-export-rendered-image`
- [x] SVG を PNG に変換してダウンロードできるようにする。`spec: 009-export-rendered-image`
- [x] エクスポート失敗時はポップアップ内に短いエラーメッセージを表示する。`spec: 009-export-rendered-image`

- [x] ポップアップ内に新規タブ表示ボタンを追加する。`spec: 010-open-in-new-tab`
- [x] SVG を新規タブで開く。`spec: 010-open-in-new-tab`
- [x] 新規タブは doctype 付きのHTMLで表示する。`spec: 010-open-in-new-tab`
- [x] レンダリング完了まで新規タブボタンを無効化する。`spec: 010-open-in-new-tab`
- [x] README を作成し、概要・機能・使い方・ビルド/読み込み手順・開発コマンドを記載する。`spec: 013-readme`
- [x] プロジェクト名を mermaid-translator に統一する。`spec: 014-project-rename`

- [x] ポップアップツールバーに Edit ボタンを追加し、「新規タブで開く」の右隣に配置する。`spec: 015-edit-mode`
- [x] `public/icons/edit.svg` をボタンアイコンとして使用する。`spec: 015-edit-mode`
- [x] Mermaid ソースが存在しない場合は Edit ボタンを無効化する。`spec: 015-edit-mode`
- [x] Edit モード用にタブ UI（View / Editor）をツールバー直下へ追加する。`spec: 015-edit-mode`
- [x] Editor タブに Mermaid ソースを編集できるテキストエリアを表示する。`spec: 015-edit-mode`
- [x] View タブで Editor の内容を使って再レンダリングする。`spec: 015-edit-mode`
- [x] 編集モードの表示をポップアップの拡張（モーダル的パネル）として実装する。`spec: 015-edit-mode`
- [x] テーマ選択が編集モードのレンダリングにも反映されるようにする。`spec: 015-edit-mode`
- [x] エクスポート系アクションが最新レンダリング結果を使用するようにする。`spec: 015-edit-mode`
- [x] 編集モードのモーダルをドラッグで移動できるようにする。`spec: 004-popup-lifecycle`
- [x] 編集モードのモーダルをリサイズで拡大縮小できるようにする。`spec: 004-popup-lifecycle`
- [x] 図の表示領域でドラッグ操作によるパン移動を追加する。`spec: 016-pan-zoom-controls`
- [x] 図の右下にズームイン/ズームアウトのボタンを追加する。`spec: 016-pan-zoom-controls`
- [x] `public/icons/zoom.svg` と `public/icons/zoom-out.svg` をボタンアイコンとして使用する。`spec: 016-pan-zoom-controls`
- [x] ズーム倍率の上下限とステップを設け、ポップアップ終了時にリセットする。`spec: 016-pan-zoom-controls`
- [x] 編集モードのView/Editor両方で右上にコピーボタンを表示する。`spec: 017-copy-mermaid-code`
- [x] `public/icons/copy.svg` をボタンアイコンとして使用する。`spec: 017-copy-mermaid-code`
- [x] Viewでは最新レンダリングのMermaidソースをコピーする。`spec: 017-copy-mermaid-code`
- [x] Editorでは現在のテキストエリア内容をコピーする。`spec: 017-copy-mermaid-code`
- [x] 選択取得・選択矩形算出の処理を専用モジュールに分割する。`spec: 018-main-refactor-split`
- [x] ポップアップ生成/破棄/位置調整の処理を専用モジュールに分割する。`spec: 018-main-refactor-split`
- [x] Editモードの状態管理とタブ切替を専用モジュールに分割する。`spec: 018-main-refactor-split`
- [x] パン/ズーム/コピー関連のUI処理を専用モジュールに分割する。`spec: 018-main-refactor-split`
- [x] テーマ設定の読み書きを専用モジュールに分割する。`spec: 018-main-refactor-split`
- [x] main.tsx をエントリ兼配線役に整理し、責務を薄くする。`spec: 018-main-refactor-split`
- [x] `manifest.json` の name/description を i18n キー参照に変更する。`spec: 019-i18n-manifest`
- [x] `public/_locales/en/messages.json` に拡張名/説明文を追加する。`spec: 019-i18n-manifest`
- [x] `public/_locales/ja/messages.json` に拡張名/説明文を追加する。`spec: 019-i18n-manifest`
- [x] `public/_locales/ko/messages.json` に拡張名/説明文を追加する。`spec: 019-i18n-manifest`
- [x] `public/_locales/zh_CN/messages.json` に拡張名/説明文を追加する。`spec: 019-i18n-manifest`
