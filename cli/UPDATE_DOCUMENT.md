# Outline ドキュメント更新手順

## 準備

1. **API設定**（以下のいずれか）:
   - `oln config set` を実行してAPIキーとURLを設定
   - または環境変数を設定:
     ```bash
     export OUTLINE_API_KEY="your-api-key"
     export OUTLINE_API_URL="https://your-instance.getoutline.com/api"
     ```

## ドキュメント更新コマンド

改善されたドキュメントをOutlineに反映するには、以下のコマンドを実行します：

```bash
oln documents update b740d075-751d-4944-8d0c-f014dcbd3aa5 \
  -f outline-getting-started-improved.md \
  -t "Outlineのはじめかた 完全ガイド" \
  --publish
```

### オプション説明

- `b740d075-751d-4944-8d0c-f014dcbd3aa5`: 更新対象のドキュメントID
- `-f outline-getting-started-improved.md`: 更新内容が含まれるファイル
- `-t "Outlineのはじめかた 完全ガイド"`: 新しいタイトル
- `--publish`: ドキュメントを公開状態にする

## 実行例

```bash
# 1. CLIディレクトリに移動
cd /Users/o6lvl4/workspace/github.com/@aid-on-libs/outline-api-client/cli

# 2. API設定（初回のみ）
oln config set
# APIキーとURLを入力

# 3. ドキュメント更新
oln documents update b740d075-751d-4944-8d0c-f014dcbd3aa5 \
  -f outline-getting-started-improved.md \
  -t "Outlineのはじめかた 完全ガイド" \
  --publish
```

## 確認

更新が成功すると、以下のような出力が表示されます：

```
✓ Document updated successfully!
📄 Document: Outlineのはじめかた 完全ガイド
  ID: b740d075-751d-4944-8d0c-f014dcbd3aa5
  Updated: 2025/8/5 XX:XX:XX
  Status: Published
```

## トラブルシューティング

- **エラー: API key is required**
  - `oln config set` を実行するか環境変数を設定してください

- **エラー: Document not found**
  - ドキュメントIDが正しいか確認してください
  - `oln documents search "Outlineのはじめかた"` で検索できます

- **エラー: Failed to read file**
  - ファイルパスが正しいか確認してください
  - 現在のディレクトリにファイルが存在するか確認してください