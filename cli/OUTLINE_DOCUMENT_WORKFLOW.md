# Outline ドキュメント改善ワークフロー

このガイドでは、Outlineのドキュメントを検索・ダウンロード・改善・更新する一連の手順を説明します。

## 前提条件

- `oln` CLIツールがインストール済み
- `oln config set` でAPI設定済み（または環境変数設定済み）

## 📋 ステップバイステップガイド

### 1. ドキュメントを検索する

タイトルでドキュメントを検索します：

```bash
oln documents search "改善したいドキュメントのタイトル"
```

出力例：
```
Found 1 results:

📄 Document: 改善したいドキュメントのタイトル
  ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  Updated: 2025/8/5 0:00:00
  Status: Published
```

**重要**: ドキュメントIDをメモしておく（後で使用）

### 2. ドキュメントをエクスポート（ダウンロード）

```bash
# distディレクトリを作成（初回のみ）
mkdir -p dist

# ドキュメントをエクスポート
oln documents export <ドキュメントID> -o dist/original.md
```

### 3. 改善版を作成

```bash
# オリジナルをコピーして改善版のベースを作成
cp dist/original.md dist/improved.md

# お好みのエディタで改善版を編集
code dist/improved.md  # VS Codeの場合
# または
vim dist/improved.md   # Vimの場合
# または
nano dist/improved.md  # Nanoの場合
```

### 4. 改善内容の確認（オプション）

```bash
# 差分を確認
diff dist/original.md dist/improved.md

# または、より見やすい形式で
diff -u dist/original.md dist/improved.md | less
```

### 5. ドキュメントを更新

```bash
oln documents update <ドキュメントID> \
  -f dist/improved.md \
  -t "新しいタイトル（変更する場合）" \
  --publish
```

## 🚀 ワンライナー版（上級者向け）

すべてのステップを変数を使って効率化：

```bash
# タイトルとIDを設定
TITLE="改善したいドキュメントのタイトル"
DOC_ID=$(oln documents search "$TITLE" | grep "ID:" | awk '{print $2}')

# エクスポート、編集、更新
oln documents export $DOC_ID -o dist/original.md && \
cp dist/original.md dist/improved.md && \
code dist/improved.md && \
read -p "編集が完了したらEnterを押してください..." && \
oln documents update $DOC_ID -f dist/improved.md --publish
```

## 📁 推奨ディレクトリ構造

```
project/
├── dist/
│   ├── original.md      # エクスポートしたオリジナル
│   ├── improved.md      # 改善版
│   └── backup/          # バックアップ用（オプション）
│       ├── 2025-08-05-original.md
│       └── 2025-08-05-improved.md
```

## 💡 便利なスクリプト

以下のスクリプトを `update-outline-doc.sh` として保存：

```bash
#!/bin/bash

# 使用方法: ./update-outline-doc.sh "ドキュメントタイトル"

set -e  # エラーがあれば停止

TITLE="$1"
if [ -z "$TITLE" ]; then
    echo "使用方法: $0 \"ドキュメントタイトル\""
    exit 1
fi

# ディレクトリ作成
mkdir -p dist/backup

# ドキュメント検索
echo "🔍 ドキュメントを検索中..."
SEARCH_RESULT=$(oln documents search "$TITLE")
echo "$SEARCH_RESULT"

# IDを抽出
DOC_ID=$(echo "$SEARCH_RESULT" | grep -oP 'ID: \K[a-f0-9-]+' | head -1)
if [ -z "$DOC_ID" ]; then
    echo "❌ ドキュメントが見つかりませんでした"
    exit 1
fi

echo "📥 ドキュメントID: $DOC_ID"

# エクスポート
echo "📥 ドキュメントをダウンロード中..."
oln documents export "$DOC_ID" -o dist/original.md

# バックアップ
DATE=$(date +%Y-%m-%d-%H%M%S)
cp dist/original.md "dist/backup/${DATE}-original.md"

# 改善版作成
cp dist/original.md dist/improved.md
echo "✅ dist/improved.md を作成しました"

# エディタで開く
echo "📝 エディタで改善版を編集してください..."
${EDITOR:-code} dist/improved.md

# 更新確認
echo ""
read -p "更新を実行しますか？ (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # タイトル変更確認
    read -p "タイトルを変更しますか？ (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "新しいタイトル: " NEW_TITLE
        oln documents update "$DOC_ID" -f dist/improved.md -t "$NEW_TITLE" --publish
    else
        oln documents update "$DOC_ID" -f dist/improved.md --publish
    fi
    
    # バックアップ
    cp dist/improved.md "dist/backup/${DATE}-improved.md"
    echo "✅ 更新完了！バックアップも保存しました"
else
    echo "❌ 更新をキャンセルしました"
fi
```

スクリプトを実行可能にする：
```bash
chmod +x update-outline-doc.sh
```

使用例：
```bash
./update-outline-doc.sh "Outlineのはじめかた"
```

## 🎯 ベストプラクティス

1. **バックアップを取る**: 重要なドキュメントは更新前にバックアップ
2. **差分確認**: 大きな変更の場合は必ず差分を確認
3. **段階的更新**: 大規模な改善は複数回に分けて実施
4. **バージョン管理**: Gitでdistディレクトリを管理することも検討

## ⚠️ 注意事項

- `--publish` オプションを付けると即座に公開されます
- 公開したくない場合は `--publish` を外してください
- 大量のドキュメントを更新する場合はAPI制限に注意

## 🔧 トラブルシューティング

### エラー: Document not found
- ドキュメントIDが正しいか確認
- タイトルで再検索してみる

### エラー: Failed to read file
- ファイルパスが正しいか確認
- ファイルの読み取り権限があるか確認

### エラー: API key is required
- `oln config show` で設定を確認
- 必要に応じて `oln config set` を再実行

---

このワークフローを使えば、Outlineのドキュメントを効率的に改善・更新できます！