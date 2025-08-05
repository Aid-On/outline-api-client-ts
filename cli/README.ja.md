# 🚀 OLN - Outline CLI

[![npm version](https://badge.fury.io/js/oln-cli.svg)](https://badge.fury.io/js/oln-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Outline APIのコマンドラインインターフェース。ターミナルからOutlineナレッジベースに簡単にアクセスできます。

## ✨ 機能

- 🔐 **セキュアな認証** - API認証情報を設定する複数の方法
- 📄 **ドキュメント管理** - ドキュメントの作成、読み取り、更新、削除
- 📁 **コレクション操作** - コレクション内でドキュメントを整理
- 🔍 **強力な検索** - ナレッジベース全体を検索
- 📤 **エクスポート機能** - 複数の形式でドキュメントをエクスポート
- 🎨 **美しい出力** - 直感的なアイコンを使用したカラー出力
- ⚡ **高速で効率的** - パフォーマンスを重視して構築
- 🔧 **柔軟な設定** - 環境変数または設定ファイル

## 📦 インストール

### グローバルインストール
```bash
npm install -g oln-cli
```

### npxを使用
```bash
npx oln-cli
```

### ソースから
```bash
git clone https://github.com/aid-on-libs/outline-api-client.git
cd outline-api-client/cli
npm install
npm link
```

## 🔧 設定

### APIキーのセットアップ

OutlineインスタンスからAPIキーが必要です。Outlineワークスペースの**設定 → API & アプリ**から取得できます。

### 設定方法

#### 1️⃣ 環境変数（セキュリティのため推奨）
```bash
export OUTLINE_API_KEY=your_api_key_here
export OUTLINE_API_URL=https://your-subdomain.getoutline.com/api
```

#### 2️⃣ 設定ファイル
```bash
oln config set
```
APIキーの入力を求められ、`~/.oln/config.json`に安全に保存されます

#### 3️⃣ コマンドラインフラグ
```bash
oln -k your_api_key_here docs list
```

## 📖 使用方法

### 🔑 認証コマンド

```bash
# 接続をテストしてユーザー情報を表示
oln auth info

# API接続をテスト
oln auth test

# APIキーを一覧表示
oln auth keys
```

### 📄 ドキュメントコマンド

```bash
# ドキュメントを一覧表示
oln docs list
oln docs list --limit 10 --sort title

# ドキュメントを検索
oln docs search "query"
oln docs search "query" --collection <collection-id>

# ドキュメント情報を取得
oln docs info <document-id>

# 新しいドキュメントを作成
oln docs create
oln docs create --title "My Document" --collection <collection-id>

# ドキュメントを更新
oln docs update <document-id>
oln docs update <document-id> --title "New Title"

# ドキュメントを削除
oln docs delete <document-id>
oln docs delete <document-id> --permanent

# ドキュメントをエクスポート
oln docs export <document-id>
oln docs export <document-id> --format pdf --output document.pdf
```

### 📁 コレクションコマンド

```bash
# コレクションを一覧表示
oln cols list

# コレクション情報を取得
oln cols info <collection-id>

# コレクション内のドキュメントを一覧表示
oln cols docs <collection-id>

# コレクションを作成
oln cols create
oln cols create --name "My Collection" --description "Description"

# コレクションを更新
oln cols update <collection-id>

# コレクションを削除
oln cols delete <collection-id>

# コレクションをエクスポート
oln cols export <collection-id>
oln cols export <collection-id> --format json
```

### ⚙️ 設定コマンド

```bash
# 設定を行う（対話型）
oln config set

# 現在の設定を表示
oln config show

# 設定をクリア
oln config clear
```

## 💡 例

### ドキュメントの作成と公開

```bash
# 新しいドキュメントを対話的に作成
oln docs create

# またはオプション付きで
oln docs create \
  --title "Meeting Notes" \
  --collection abc123 \
  --publish
```

### 検索とエクスポート

```bash
# ドキュメントを検索
oln docs search "API documentation"

# 検索結果をエクスポート
oln docs search "API" --limit 5 | \
  xargs -I {} oln docs export {} --format markdown
```

### バッチ操作

```bash
# コレクション内のすべてのドキュメントを一覧表示してエクスポート
oln cols docs <collection-id> --limit 100 | \
  grep "ID:" | \
  awk '{print $2}' | \
  xargs -I {} oln docs export {} --output "exports/{}.md"

# コレクション構造全体をバックアップ
for col in $(oln cols list | grep "ID:" | awk '{print $2}'); do
  mkdir -p "backup/$col"
  oln cols export $col --output "backup/$col/collection.json"
  oln cols docs $col | grep "ID:" | awk '{print $2}' | \
    xargs -I {} oln docs export {} --output "backup/$col/{}.md"
done
```

### 高度なワークフロー

```bash
# 特定のテキストを含むすべてのドキュメントを検索して更新
oln docs search "TODO" | grep "ID:" | awk '{print $2}' | \
  while read id; do
    echo "Processing document $id..."
    oln docs update $id --append "\n\n[Updated on $(date)]"
  done

# クリップボードの内容からドキュメントを作成（macOS）
pbpaste | oln docs create --title "From Clipboard" --stdin
```

## 🎨 出力形式

CLIは直感的なアイコンを使用した美しいカラー出力を提供します：

- 📄 ドキュメント
- 📁 コレクション
- 👤 ユーザー
- 🏢 チーム
- 🔑 APIキー
- ✅ 成功
- ❌ エラー
- ⚠️  警告
- ℹ️  情報

## 🌍 環境変数

| 変数 | 説明 | デフォルト |
|----------|-------------|---------|
| `OUTLINE_API_KEY` | OutlineのAPIキー | - |
| `OUTLINE_API_URL` | OutlineのAPI URL | `https://app.getoutline.com/api` |
| `OLN_CONFIG_PATH` | カスタム設定ファイルパス | `~/.oln/config.json` |
| `NO_COLOR` | カラー出力を無効化 | `false` |

## 🚑 トラブルシューティング

### APIキーの問題

認証エラーが発生する場合：

1. APIキーが正しいことを確認
   ```bash
   oln auth test
   ```
2. API URLがOutlineインスタンスと一致していることを確認
3. APIキーに必要な権限があることを確認

### 接続の問題

接続できない場合：

1. インターネット接続を確認
2. API URLが正しいことを確認（`/api`で終わる必要があります）
   ```bash
   curl -I https://your-subdomain.getoutline.com/api
   ```
3. Outlineインスタンスにアクセス可能であることを確認
4. 企業ファイアウォールの背後にいる場合はプロキシ設定を確認

### よくあるエラー

| エラー | 解決策 |
|-------|----------|
| `ENOTFOUND` | API URLを確認 |
| `401 Unauthorized` | APIキーを確認 |
| `403 Forbidden` | APIキーの権限を確認 |
| `404 Not Found` | ドキュメント/コレクションIDを確認 |

## 🛠️ 開発

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/aid-on-libs/outline-api-client.git
cd outline-api-client/cli

# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev -- <command>
```

### コマンド

```bash
# プロジェクトをビルド
npm run build

# 型チェック
npm run type-check

# テストを実行
npm test

# コードをリント
npm run lint
```

### プロジェクト構造

```
cli/
├── src/
│   ├── commands/     # コマンド実装
│   ├── utils/        # ユーティリティ関数
│   ├── types/        # TypeScript型定義
│   └── index.ts      # エントリーポイント
├── dist/             # ビルドされたファイル
└── package.json      # 依存関係とスクリプト
```

## 🤝 貢献

貢献を歓迎します！プルリクエストをお気軽に送信してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は[LICENSE](../LICENSE)ファイルを参照してください。

## 🔗 リンク

- [NPMパッケージ](https://www.npmjs.com/package/oln-cli)
- [GitHubリポジトリ](https://github.com/aid-on-libs/outline-api-client)
- [イシューと機能リクエスト](https://github.com/aid-on-libs/outline-api-client/issues)
- [Outlineドキュメント](https://www.getoutline.com/developers)
