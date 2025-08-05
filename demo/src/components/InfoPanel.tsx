import React from 'react';

export default function InfoPanel() {
  return (
    <div style={{
      backgroundColor: '#e3f2fd',
      border: '1px solid #90caf9',
      borderRadius: '8px',
      padding: '1.5rem',
      margin: '2rem auto',
      maxWidth: '800px',
    }}>
      <h3 style={{ color: '#1976d2', marginTop: 0 }}>📘 How to Use This Library</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h4>🚫 Browser Limitations</h4>
        <p>
          Outline SaaS (app.getoutline.com) does not allow direct browser access due to CORS security policies. 
          This is a browser limitation, not a library issue.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4>✅ Recommended Usage</h4>
        <ul>
          <li><strong>Node.js Applications</strong> - Full API access without restrictions</li>
          <li><strong>Server-side Apps</strong> - Next.js, Express, etc.</li>
          <li><strong>Backend Services</strong> - API integrations, automation scripts</li>
          <li><strong>Proxy Server</strong> - Create your own API proxy for browser access</li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4>🔧 Setting Up a Proxy Server (Express Example)</h4>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.875rem',
        }}>
{`// proxy-server.js
const express = require('express');
const { createOutlineClient } = require('outline-api-client');

const app = express();
app.use(express.json());

// Enable CORS for your demo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// Proxy endpoint
app.post('/api/outline/*', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const client = createOutlineClient(apiKey);
  // Handle the API call...
});

app.listen(3001);`}
        </pre>
      </div>

      <div>
        <h4>💻 Example Code</h4>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
        }}>
{`// Node.js usage example
import { createOutlineClient } from 'outline-api-client';

const client = createOutlineClient('your-api-key');

// List documents
const docs = await client.documents.list();

// Search
const results = await client.documents.search('query');

// Create document
const newDoc = await client.documents.create({
  title: 'New Document',
  text: '# Content',
  collectionId: 'collection-id',
  publish: true
});`}
        </pre>
      </div>
    </div>
  );
}