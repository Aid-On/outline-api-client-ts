# Outline API Client

A TypeScript client library for the [Outline](https://www.getoutline.com/) knowledge base API, providing type-safe methods to interact with documents, collections, and authentication.

## ✨ Features

- 🚀 **Full TypeScript Support** - Complete type definitions for all API endpoints
- 🔄 **Automatic Retry Logic** - Built-in retry mechanism for failed requests
- 📄 **Document Management** - Create, read, update, delete, and search documents
- 📁 **Collection Management** - Organize documents with collections
- 🔐 **Authentication** - Secure API key authentication
- ⚡ **Async Iterators** - Efficiently iterate through large datasets
- 🛡️ **Error Handling** - Comprehensive error types and handling

## 📦 Installation

```bash
npm install outline-api-client
```

## 🚀 Quick Start

```typescript
import { createOutlineClient } from 'outline-api-client';

// Initialize the client
const client = createOutlineClient('your-api-key');

// Get document list
const documents = await client.documents.list({ limit: 10 });

// Search documents
const results = await client.documents.search('API design');

// Create a new document
const newDoc = await client.documents.create({
  title: 'New Document',
  text: '# Content\n\nDocument content here',
  collectionId: 'collection-id',
  publish: true
});
```

## 🌐 Browser Usage Note

This library is primarily designed for **Node.js environments**. Outline's SaaS platform (app.getoutline.com) does not allow direct browser access due to CORS restrictions. For browser-based applications, you'll need to:

1. Create a backend proxy server
2. Use server-side rendering (Next.js, etc.)
3. Build a backend API that uses this library

## 📖 API Reference

### Client Initialization

```typescript
import { OutlineClient } from 'outline-api-client';

const client = new OutlineClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://app.getoutline.com/api', // optional
  timeout: 30000, // optional, in milliseconds
  retryAttempts: 3, // optional
  retryDelay: 1000 // optional, in milliseconds
});
```

### Documents API

#### List Documents
```typescript
const response = await client.documents.list({
  collectionId: 'collection-id',
  limit: 25,
  offset: 0,
  sort: 'updatedAt',
  direction: 'DESC'
});
```

#### Get Document Info
```typescript
const doc = await client.documents.info('document-id');
```

#### Search Documents
```typescript
const results = await client.documents.search('search query', {
  collectionId: 'collection-id',
  includeArchived: false,
  includeDrafts: false,
  limit: 25
});
```

#### Create Document
```typescript
const newDoc = await client.documents.create({
  title: 'Document Title',
  text: '# Markdown content',
  collectionId: 'collection-id',
  parentDocumentId: 'parent-id', // optional
  publish: true
});
```

#### Update Document
```typescript
const updated = await client.documents.update('document-id', {
  title: 'Updated Title',
  text: 'Updated content',
  publish: true
});
```

#### Delete Document
```typescript
await client.documents.delete('document-id', permanent);
```

#### Export Document
```typescript
const exported = await client.documents.export('document-id', 'markdown');
// formats: 'markdown', 'html', 'pdf'
```

### Collections API

#### List Collections
```typescript
const collections = await client.collections.list();
```

#### Get Collection Info
```typescript
const collection = await client.collections.info('collection-id');
```

#### Create Collection
```typescript
const newCollection = await client.collections.create({
  name: 'New Collection',
  description: 'Collection description',
  color: '#4285F4',
  permission: 'read_write'
});
```

#### Get Collection Documents
```typescript
const docs = await client.collections.documents('collection-id', {
  limit: 50,
  offset: 0
});
```

### Auth API

#### Get Auth Info
```typescript
const authInfo = await client.auth.info();
console.log(authInfo.data?.user);
console.log(authInfo.data?.team);
```

## 🔧 Advanced Usage

### Async Iteration

Iterate through all documents efficiently:

```typescript
// Iterate through all documents
for await (const document of client.documents.iterate()) {
  console.log(document.title);
}

// Iterate through collection documents
for await (const document of client.documents.iterate({ collectionId: 'id' })) {
  console.log(document.title);
}
```

### Error Handling

```typescript
import { OutlineAPIError } from 'outline-api-client';

try {
  const doc = await client.documents.info('invalid-id');
} catch (error) {
  if (error instanceof OutlineAPIError) {
    if (error.isNotFoundError()) {
      console.log('Document not found');
    } else if (error.isAuthError()) {
      console.log('Authentication failed');
    } else if (error.isRateLimitError()) {
      console.log('Rate limit exceeded');
    }
  }
}
```

### Custom Request Configuration

```typescript
const client = new OutlineClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://custom.outline.instance/api',
  timeout: 60000, // 60 seconds
  retryAttempts: 5,
  retryDelay: 2000 // 2 seconds
});
```

## 🖥️ Demo

A React demo is included to showcase the library's capabilities. Note that due to CORS restrictions, the demo cannot directly connect to Outline SaaS.

```bash
# Run the demo
npm run demo:dev
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

GitHub: [https://github.com/Aid-On/outline-api-client](https://github.com/Aid-On/outline-api-client)
