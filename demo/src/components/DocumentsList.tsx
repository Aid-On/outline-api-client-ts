import React from 'react';
import type { OutlineClient, Document } from 'outline-api-client';

interface DocumentsListProps {
  documents: Document[];
  client: OutlineClient;
}

export default function DocumentsList({ documents, client }: DocumentsListProps) {
  const handleView = async (id: string) => {
    try {
      const response = await client.documents.info(id);
      if (response.data) {
        alert(`Document: ${response.data.title}\n\nContent preview:\n${response.data.text.substring(0, 200)}...`);
      }
    } catch (error) {
      alert('Failed to load document');
    }
  };

  const handleExport = async (id: string) => {
    try {
      const response = await client.documents.export(id, 'markdown');
      if (response.data) {
        const blob = new Blob([response.data.data], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${id}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Failed to export document');
    }
  };

  if (documents.length === 0) {
    return <p className="empty-state">No documents found</p>;
  }

  return (
    <div className="documents-list">
      <h2>Recent Documents</h2>
      {documents.map(doc => (
        <div key={doc.id} className="document-item">
          <div className="document-header">
            <span className="document-emoji">{doc.emoji || '📄'}</span>
            <h3>{doc.title}</h3>
          </div>
          <p className="document-meta">
            Updated: {new Date(doc.updatedAt).toLocaleDateString()}
            {doc.publishedAt ? ' • Published' : ' • Draft'}
          </p>
          <div className="document-actions">
            <button className="action-btn" onClick={() => handleView(doc.id)}>
              View
            </button>
            <button className="action-btn" onClick={() => handleExport(doc.id)}>
              Export
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}