# Outline API Client

[Outline](https://www.getoutline.com/)ナレッジベースAPIのためのTypeScriptクライアントライブラリです。ドキュメント、コレクション、認証との型安全なやり取りを提供します。

## ✨ 特徴

- 🚀 **完全なTypeScriptサポート** - すべてのAPIエンドポイントの完全な型定義
- 🔄 **自動リトライロジック** - 失敗したリクエストの組み込みリトライメカニズム
- 📄 **ドキュメント管理** - ドキュメントの作成、読み取り、更新、削除、検索
- 📁 **コレクション管理** - コレクションでドキュメントを整理
- 🔐 **認証** - 安全なAPIキー認証
- ⚡ **非同期イテレータ** - 大規模なデータセットを効率的に反復処理
- 🛡️ **エラーハンドリング** - 包括的なエラータイプとハンドリング

## 📦 インストール

```bash
npm install outline-api-client
```

> **注意**: このライブラリはNode.js環境向けに設計されており、CORS制限のためブラウザでの直接使用はできません。ブラウザベースのアプリケーションについては、[デモアプリケーション](demo/)がプロキシサーバーの実装例を提供しています。

## 🚀 クイックスタート

```typescript
import { createOutlineClient } from 'outline-api-client';

// クライアントの初期化
const client = createOutlineClient('your-api-key');

// ドキュメントリストの取得
const documents = await client.documents.list({ limit: 10 });

// ドキュメントの検索
const results = await client.documents.search('API設計');

// 新しいドキュメントの作成
const newDoc = await client.documents.create({
  title: '新しいドキュメント',
  text: '# 内容\n\nドキュメントの内容をここに',
  collectionId: 'collection-id',
  publish: true
});
```

## 📖 APIリファレンス

### クライアントの初期化

```typescript
import { OutlineClient } from 'outline-api-client';

const client = new OutlineClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://app.getoutline.com/api', // オプション
  timeout: 30000, // オプション、ミリ秒単位
  retryAttempts: 3, // オプション
  retryDelay: 1000 // オプション、ミリ秒単位
});
```

### Documents API

#### ドキュメントの一覧取得
```typescript
const response = await client.documents.list({
  collectionId: 'collection-id',
  limit: 25,
  offset: 0,
  sort: 'updatedAt',
  direction: 'DESC'
});
```

#### ドキュメント情報の取得
```typescript
const doc = await client.documents.info('document-id');
```

#### ドキュメントの検索
```typescript
const results = await client.documents.search('検索クエリ', {
  collectionId: 'collection-id',
  includeArchived: false,
  includeDrafts: false,
  limit: 25
});
```

#### ドキュメントの作成
```typescript
const newDoc = await client.documents.create({
  title: 'ドキュメントタイトル',
  text: '# マークダウンコンテンツ',
  collectionId: 'collection-id',
  parentDocumentId: 'parent-id', // オプション
  publish: true
});
```

#### ドキュメントの更新
```typescript
const updated = await client.documents.update('document-id', {
  title: '更新されたタイトル',
  text: '更新されたコンテンツ',
  publish: true
});
```

#### ドキュメントの削除
```typescript
await client.documents.delete('document-id', permanent);
```

#### ドキュメントのエクスポート
```typescript
const exported = await client.documents.export('document-id', 'markdown');
// フォーマット: 'markdown', 'html', 'pdf'
```

### Collections API

#### コレクションの一覧取得
```typescript
const collections = await client.collections.list();
```

#### コレクション情報の取得
```typescript
const collection = await client.collections.info('collection-id');
```

#### コレクションの作成
```typescript
const newCollection = await client.collections.create({
  name: '新しいコレクション',
  description: 'コレクションの説明',
  color: '#4285F4',
  permission: 'read_write'
});
```

#### コレクションのドキュメント取得
```typescript
const docs = await client.collections.documents('collection-id', {
  limit: 50,
  offset: 0
});
```

### Auth API

#### 認証情報の取得
```typescript
const authInfo = await client.auth.info();
console.log(authInfo.data?.user);
console.log(authInfo.data?.team);
```

## 🔧 高度な使い方

### 非同期反復処理

すべてのドキュメントを効率的に反復処理：

```typescript
// すべてのドキュメントを反復処理
for await (const document of client.documents.iterate()) {
  console.log(document.title);
}

// コレクションのドキュメントを反復処理
for await (const document of client.documents.iterate({ collectionId: 'id' })) {
  console.log(document.title);
}
```

### エラーハンドリング

```typescript
import { OutlineAPIError } from 'outline-api-client';

try {
  const doc = await client.documents.info('invalid-id');
} catch (error) {
  if (error instanceof OutlineAPIError) {
    if (error.isNotFoundError()) {
      console.log('ドキュメントが見つかりません');
    } else if (error.isAuthError()) {
      console.log('認証に失敗しました');
    } else if (error.isRateLimitError()) {
      console.log('レート制限を超えました');
    }
  }
}
```

### カスタムリクエスト設定

```typescript
const client = new OutlineClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://custom.outline.instance/api',
  timeout: 60000, // 60秒
  retryAttempts: 5,
  retryDelay: 2000 // 2秒
});
```

### バッチ操作

複数のドキュメントを効率的に処理：

```typescript
// 検索結果をすべてエクスポート
const searchResults = await client.documents.search('重要');
for (const doc of searchResults.data) {
  const exported = await client.documents.export(doc.id, 'pdf');
  // エクスポートされたコンテンツを保存または処理
}

// コレクションをバックアップ
const collections = await client.collections.list();
for (const collection of collections.data) {
  const docs = await client.collections.documents(collection.id);
  // ドキュメントをエクスポートまたはバックアップ
}
```

### TypeScript統合

すべてのAPIレスポンスは完全に型付けされています：

```typescript
import type { Document, Collection, User } from 'outline-api-client';

const doc: Document = await client.documents.info('id');
const collection: Collection = await client.collections.info('id');
```

## 📄 ライセンス

MIT

## 🤝 貢献

貢献を歓迎します！お気軽にプルリクエストを送信してください。

GitHub: [https://github.com/Aid-On/outline-api-client](https://github.com/Aid-On/outline-api-client)
