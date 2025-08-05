import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

type TabType = 'quickstart' | 'documents' | 'collections' | 'auth' | 'advanced' | 'errors';

const CheatSheet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('quickstart');

  const renderContent = () => {
    switch (activeTab) {
      case 'quickstart':
        return <QuickStart />;
      case 'documents':
        return <DocumentsAPI />;
      case 'collections':
        return <CollectionsAPI />;
      case 'auth':
        return <AuthAPI />;
      case 'advanced':
        return <AdvancedUsage />;
      case 'errors':
        return <ErrorHandling />;
      default:
        return null;
    }
  };

  return (
    <div className="cheat-sheet">
      <div className="cheat-sheet-header">
        <h1>📚 Outline API Client Cheat Sheet</h1>
        <p className="subtitle">Complete reference guide for outline-api-client library</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'quickstart' ? 'active' : ''}`}
          onClick={() => setActiveTab('quickstart')}
        >
          🚀 Quick Start
        </button>
        <button 
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents
        </button>
        <button 
          className={`tab ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          📁 Collections
        </button>
        <button 
          className={`tab ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          🔐 Auth
        </button>
        <button 
          className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          ⚡ Advanced
        </button>
        <button 
          className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          🛡️ Errors
        </button>
      </div>

      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'typescript' }) => (
  <div className="code-block">
    <SyntaxHighlighter language={language} style={docco}>
      {code.trim()}
    </SyntaxHighlighter>
  </div>
);

const QuickStart: React.FC = () => (
  <div className="section">
    <h2>Installation</h2>
    <CodeBlock language="bash" code={`npm install outline-api-client`} />

    <h2>Basic Setup</h2>
    <CodeBlock code={`import { createOutlineClient } from 'outline-api-client';

// Simple initialization
const client = createOutlineClient('your-api-key');

// With options
const client = new OutlineClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://app.getoutline.com/api',
  timeout: 30000,        // 30 seconds
  retryAttempts: 3,      // Retry failed requests 3 times
  retryDelay: 1000       // Wait 1 second between retries
});`} />

    <h2>First API Call</h2>
    <CodeBlock code={`// Check connection
const isConnected = await client.ping();
console.log('Connected:', isConnected);

// Get auth info
const authInfo = await client.auth.info();
console.log('User:', authInfo.data?.user.name);
console.log('Team:', authInfo.data?.team.name);`} />

    <div className="info-box">
      <strong>⚠️ Important:</strong> This library is designed for Node.js environments. 
      Browser usage requires a proxy server due to CORS restrictions.
    </div>
  </div>
);

const DocumentsAPI: React.FC = () => (
  <div className="section">
    <h2>List Documents</h2>
    <CodeBlock code={`// Basic list
const docs = await client.documents.list();

// With options
const docs = await client.documents.list({
  collectionId: 'col-123',
  parentDocumentId: 'doc-456',
  sort: 'updatedAt',
  direction: 'DESC',
  limit: 25,
  offset: 0,
  template: false
});`} />

    <h2>Search Documents</h2>
    <CodeBlock code={`// Basic search
const results = await client.documents.search('API design');

// Advanced search
const results = await client.documents.search('query', {
  collectionId: 'col-123',
  includeArchived: false,
  includeDrafts: false,
  dateFilter: 'month',
  userId: 'user-123',
  limit: 10
});`} />

    <h2>Get Document</h2>
    <CodeBlock code={`const doc = await client.documents.info('document-id');
console.log(doc.data?.title);
console.log(doc.data?.text);`} />

    <h2>Create Document</h2>
    <CodeBlock code={`const newDoc = await client.documents.create({
  title: 'API Documentation',
  text: '# API Reference\\n\\nContent here...',
  collectionId: 'col-123',
  parentDocumentId: 'parent-id',  // optional
  template: false,
  templateId: undefined,
  publish: true,
  emoji: '📄',
  fullWidth: false
});`} />

    <h2>Update Document</h2>
    <CodeBlock code={`const updated = await client.documents.update('doc-id', {
  title: 'Updated Title',
  text: 'Updated content',
  emoji: '📝',
  fullWidth: true,
  append: false,      // Append to existing content
  publish: true,
  done: false        // Mark as done (for tasks)
});`} />

    <h2>Delete Document</h2>
    <CodeBlock code={`// Soft delete (can be restored)
await client.documents.delete('doc-id');

// Permanent delete
await client.documents.delete('doc-id', true);`} />

    <h2>Archive/Unarchive</h2>
    <CodeBlock code={`// Archive document
await client.documents.archive('doc-id');

// Unarchive document
await client.documents.unarchive('doc-id');`} />

    <h2>Export Document</h2>
    <CodeBlock code={`// Export as markdown (default)
const exported = await client.documents.export('doc-id');

// Export as HTML
const html = await client.documents.export('doc-id', 'html');

// Export as PDF
const pdf = await client.documents.export('doc-id', 'pdf');`} />

    <h2>Star/Unstar</h2>
    <CodeBlock code={`// Star a document
await client.documents.star('doc-id');

// Unstar a document
await client.documents.unstar('doc-id');`} />

    <h2>Move Document</h2>
    <CodeBlock code={`const moved = await client.documents.move('doc-id', {
  parentDocumentId: 'new-parent-id',
  collectionId: 'new-collection-id',
  index: 0  // Position in the list
});`} />
  </div>
);

const CollectionsAPI: React.FC = () => (
  <div className="section">
    <h2>List Collections</h2>
    <CodeBlock code={`const collections = await client.collections.list();

// With pagination
const collections = await client.collections.list({
  limit: 10,
  offset: 0
});`} />

    <h2>Get Collection</h2>
    <CodeBlock code={`const collection = await client.collections.info('collection-id');
console.log(collection.data?.name);
console.log(collection.data?.description);`} />

    <h2>Create Collection</h2>
    <CodeBlock code={`const newCollection = await client.collections.create({
  name: 'Engineering Docs',
  description: 'Technical documentation',
  color: '#4285F4',
  icon: '🔧',
  permission: 'read_write',  // 'read' | 'read_write' | 'admin'
  sharing: true,
  sort: {
    field: 'title',         // 'title' | 'index'
    direction: 'asc'        // 'asc' | 'desc'
  }
});`} />

    <h2>Update Collection</h2>
    <CodeBlock code={`const updated = await client.collections.update('col-id', {
  name: 'Updated Name',
  description: 'New description',
  color: '#EA4335',
  icon: '📚',
  permission: 'read',
  sharing: false
});`} />

    <h2>Delete Collection</h2>
    <CodeBlock code={`await client.collections.delete('collection-id');`} />

    <h2>Get Collection Documents</h2>
    <CodeBlock code={`const docs = await client.collections.documents('col-id', {
  limit: 50,
  offset: 0,
  sort: 'updatedAt',
  direction: 'DESC'
});`} />

    <h2>Export Collection</h2>
    <CodeBlock code={`// Export single collection
const exported = await client.collections.export('col-id');

// Export as JSON
const json = await client.collections.export('col-id', 'json');

// Export all collections
const allExported = await client.collections.exportAll();`} />

    <h2>Manage Members</h2>
    <CodeBlock code={`// Add user to collection
const membership = await client.collections.addUser('col-id', 'user-id', 'read_write');

// Remove user from collection
await client.collections.removeUser('col-id', 'user-id');

// List collection memberships
const memberships = await client.collections.memberships('col-id');`} />

    <h2>Manage Groups</h2>
    <CodeBlock code={`// Add group to collection
const group = await client.collections.addGroup('col-id', 'group-id', 'read');

// Remove group from collection
await client.collections.removeGroup('col-id', 'group-id');`} />
  </div>
);

const AuthAPI: React.FC = () => (
  <div className="section">
    <h2>Get Auth Info</h2>
    <CodeBlock code={`const authInfo = await client.auth.info();

// Access user info
const user = authInfo.data?.user;
console.log('Name:', user.name);
console.log('Email:', user.email);
console.log('Admin:', user.isAdmin);

// Access team info
const team = authInfo.data?.team;
console.log('Team:', team.name);
console.log('Subdomain:', team.subdomain);`} />

    <h2>API Keys Management</h2>
    <CodeBlock code={`// List API keys
const keys = await client.auth.apiKeys();

// Create new API key
const newKey = await client.auth.createApiKey('CI/CD Pipeline Key');
console.log('New key:', newKey.data?.secret); // Only shown once!

// Delete API key
await client.auth.deleteApiKey('key-id');`} />

    <h2>Connection Test</h2>
    <CodeBlock code={`// Simple ping test
const isConnected = await client.ping();
if (!isConnected) {
  console.error('Failed to connect to Outline API');
}`} />
  </div>
);

const AdvancedUsage: React.FC = () => (
  <div className="section">
    <h2>Async Iteration</h2>
    <CodeBlock code={`// Iterate through ALL documents (auto-pagination)
for await (const doc of client.documents.iterate()) {
  console.log(doc.title);
  // Process each document
}

// Iterate with filters
for await (const doc of client.documents.iterate({ 
  collectionId: 'col-123' 
})) {
  console.log(doc.title);
}

// Iterate collections
for await (const collection of client.collections.iterate()) {
  console.log(collection.name);
}`} />

    <h2>Pagination Handling</h2>
    <CodeBlock code={`let offset = 0;
const limit = 25;
let hasMore = true;

while (hasMore) {
  const response = await client.documents.list({ 
    offset, 
    limit 
  });
  
  const docs = response.data || [];
  
  // Process documents
  docs.forEach(doc => console.log(doc.title));
  
  // Check if more pages exist
  hasMore = docs.length === limit;
  offset += limit;
}`} />

    <h2>Custom Fetch Implementation</h2>
    <CodeBlock code={`import { fetch as customFetch } from 'custom-fetch-library';

const client = new OutlineClient({
  apiKey: 'your-api-key',
  fetchImplementation: customFetch
});`} />

    <h2>Batch Operations</h2>
    <CodeBlock code={`// Process multiple documents in parallel
const documentIds = ['doc-1', 'doc-2', 'doc-3'];

const documents = await Promise.all(
  documentIds.map(id => client.documents.info(id))
);

// Bulk archive
const archiveResults = await Promise.all(
  documentIds.map(id => client.documents.archive(id))
);`} />

    <h2>Search with Highlighting</h2>
    <CodeBlock code={`const results = await client.documents.search('important', {
  snippet: true  // Include context snippets
});

results.data?.forEach(doc => {
  console.log('Title:', doc.title);
  console.log('Context:', doc.context);  // Surrounding text
  console.log('Highlight:', doc.highlight); // Matched text
});`} />
  </div>
);

const ErrorHandling: React.FC = () => (
  <div className="section">
    <h2>Error Types</h2>
    <CodeBlock code={`import { OutlineAPIError } from 'outline-api-client';

try {
  const doc = await client.documents.info('invalid-id');
} catch (error) {
  if (error instanceof OutlineAPIError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Code:', error.code);
    console.log('Data:', error.data);
  }
}`} />

    <h2>Error Type Checking</h2>
    <CodeBlock code={`try {
  const doc = await client.documents.info('doc-id');
} catch (error) {
  if (error instanceof OutlineAPIError) {
    if (error.isNotFoundError()) {
      console.log('Document not found');
    } else if (error.isAuthError()) {
      console.log('Authentication failed');
    } else if (error.isRateLimitError()) {
      console.log('Rate limit exceeded, retry later');
    } else if (error.isValidationError()) {
      console.log('Invalid request data');
    } else if (error.isServerError()) {
      console.log('Server error, retry later');
    }
  }
}`} />

    <h2>Common Error Scenarios</h2>
    <CodeBlock code={`// 401 - Invalid API key
// Solution: Check your API key

// 403 - Insufficient permissions
// Solution: User needs higher permissions

// 404 - Resource not found
// Solution: Check if ID exists

// 429 - Rate limit exceeded
// Solution: Implement backoff strategy

// 500 - Server error
// Solution: Retry with exponential backoff`} />

    <h2>Retry Configuration</h2>
    <CodeBlock code={`const client = new OutlineClient({
  apiKey: 'your-api-key',
  retryAttempts: 5,     // Retry up to 5 times
  retryDelay: 2000      // Start with 2 second delay
});

// The library automatically retries:
// - Network errors
// - 5xx server errors
// - Rate limit errors (429)

// It does NOT retry:
// - Client errors (4xx except 429)
// - Validation errors`} />

    <h2>Custom Error Handling</h2>
    <CodeBlock code={`async function safeDocumentGet(id: string) {
  try {
    return await client.documents.info(id);
  } catch (error) {
    if (error instanceof OutlineAPIError) {
      // Log to monitoring service
      logger.error('Outline API Error', {
        status: error.status,
        code: error.code,
        documentId: id
      });
      
      // Return default or throw custom error
      if (error.isNotFoundError()) {
        return null;
      }
      
      throw new CustomAppError('Failed to fetch document');
    }
    throw error;
  }
}`} />
  </div>
);

export default CheatSheet;