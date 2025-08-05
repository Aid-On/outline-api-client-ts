# Outline Document Improvement Scripts

Outlineドキュメントを自動的に改善するためのスクリプト集です。Claudeを活用して、ドキュメントの構造、内容、読みやすさを向上させます。

## 🚀 クイックスタート

### 必要なツール

1. **oln** (Outline CLI)
   ```bash
   npm install -g @aid-on-libs/outline-api-client
   ```

2. **claude** (Claude CLI)
   - [Claude CLI](https://claude.ai/download) からダウンロード

3. **jq** (高度なスクリプトのみ)
   ```bash
   # macOS
   brew install jq
   
   # Ubuntu/Debian
   sudo apt-get install jq
   ```

### 基本的な使い方

```bash
# 単一のドキュメントを改善
./improve-outline-doc.sh "Outlineのはじめかた"

# タイトルを対話的に入力
./improve-outline-doc.sh
```

## 📋 スクリプト一覧

### 1. `improve-outline-doc.sh` - 基本版

シンプルで使いやすい、単一ドキュメント改善スクリプト。

**特徴:**
- 対話的なインターフェース
- 自動バックアップ
- 差分表示
- 更新前の確認

**使用例:**
```bash
# ドキュメントを指定して実行
./improve-outline-doc.sh "API Documentation"

# 対話的に実行
./improve-outline-doc.sh
```

### 2. `improve-outline-doc-advanced.sh` - 高度版

複数ドキュメントの一括処理や、改善戦略のカスタマイズが可能。

**特徴:**
- コレクション単位での一括処理
- 改善戦略の選択
- バッチ処理
- ドライラン機能
- ログ記録

**使用例:**
```bash
# コレクション内の全ドキュメントを改善
./improve-outline-doc-advanced.sh -c "4b5c8ca0-6b2c-4ad5-b51d-d8d8b37e81fe"

# 技術文書向けの改善戦略を使用
./improve-outline-doc-advanced.sh -s technical "API Reference"

# バッチファイルから複数ドキュメントを処理
./improve-outline-doc-advanced.sh -b documents.txt

# ドライランで確認
./improve-outline-doc-advanced.sh -d "My Document"

# カスタムプロンプトを使用
./improve-outline-doc-advanced.sh --custom-prompt my-prompt.txt "My Document"
```

## 🎯 改善戦略

高度版スクリプトでは、以下の改善戦略を選択できます：

| 戦略 | 説明 | 適用場面 |
|------|------|----------|
| `comprehensive` | 構造、内容、書式を総合的に改善（デフォルト） | 一般的なドキュメント |
| `minimal` | 誤字脱字の修正と明確性の向上のみ | 既に完成度の高いドキュメント |
| `technical` | 技術的正確性とコード例に焦点 | API文書、技術仕様書 |
| `business` | ビジネス価値と非技術者向けの明確性 | 提案書、ビジネス文書 |

## 📁 ディレクトリ構造

スクリプト実行後、以下の構造でファイルが保存されます：

```
outline-improvement-YYYYMMDD_HHMMSS/
├── original/          # オリジナルのドキュメント
│   └── document.md
├── improved/          # 改善されたドキュメント
│   └── document.md
├── backup/           # バックアップ
│   └── backup-YYYYMMDD_HHMMSS.md
└── prompt.txt        # Claudeへのプロンプト
```

## 🔧 高度な使い方

### バッチファイルの作成

`documents.txt`:
```
Outlineのはじめかた
インテグレーション & API 活用ガイド
今見ているOutlineとは何か？
Outline エディタ活用ガイド
```

### カスタムプロンプトの作成

`custom-prompt.txt`:
```
以下の点に特に注意してドキュメントを改善してください：

1. 日本語の自然さを重視
2. 具体的な例を3つ以上含める
3. 図表を積極的に活用
4. 初心者にも分かりやすい説明
5. 最新のOutline機能を反映

改善後のドキュメントは、元の構造を保ちつつ、
より実践的で読みやすいものにしてください。
```

### 設定ファイル

`~/.outline-improver.conf`:
```bash
# デフォルトの改善戦略
DEFAULT_STRATEGY="comprehensive"

# 並列処理数（将来の機能）
DEFAULT_PARALLEL="1"

# バックアップの保持
KEEP_BACKUPS="true"
```

## 🛡️ セキュリティとベストプラクティス

1. **APIトークンの管理**
   - 環境変数で管理: `export OUTLINE_API_TOKEN="your-token"`
   - 設定ファイルには保存しない

2. **バックアップ**
   - スクリプトは自動的にバックアップを作成
   - 重要なドキュメントは手動でも別途バックアップ

3. **段階的な適用**
   - まずドライランで確認
   - 少数のドキュメントでテスト
   - 問題なければ一括処理

## 🚨 トラブルシューティング

### よくある問題

**Q: "Document not found" エラー**
- A: タイトルが正確か確認。部分一致ではなく完全一致で検索されます。

**Q: Claude が起動しない**
- A: Claude CLIが正しくインストールされているか確認。
- A: `which claude` でパスを確認。

**Q: 改善されたファイルが作成されない**
- A: Claudeの出力先を手動で指定する必要がある場合があります。
- A: プロンプトに従って、指定されたパスにファイルを保存してください。

### ログの確認

高度版では、ログファイルを指定できます：

```bash
./improve-outline-doc-advanced.sh -l improvement.log "My Document"
```

## 🤝 貢献

改善案やバグ報告は歓迎します！

1. 問題を見つけたら Issue を作成
2. 改善案があれば Pull Request を送信
3. 新しい改善戦略の提案も歓迎

## 📜 ライセンス

このスクリプトはMITライセンスで提供されます。

---

**Happy Documenting! 📝✨**