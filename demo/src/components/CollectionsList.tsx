import React from 'react';
import type { OutlineClient, Collection } from 'outline-api-client';

interface CollectionsListProps {
  collections: Collection[];
  client: OutlineClient;
}

export default function CollectionsList({ collections, client }: CollectionsListProps) {
  const handleViewCollection = async (id: string) => {
    try {
      const response = await client.collections.documents(id, { limit: 10 });
      const docs = response.data || [];
      
      alert(`Collection contains ${docs.length} documents:\n\n${docs.map(d => `• ${d.title}`).join('\n')}`);
    } catch (error) {
      alert('Failed to load collection documents');
    }
  };

  if (collections.length === 0) {
    return <p className="empty-state">No collections found</p>;
  }

  return (
    <div className="collections-list">
      <h2>Collections</h2>
      {collections.map(col => (
        <div key={col.id} className="collection-item">
          <div className="collection-header">
            <span className="collection-icon" style={{ color: col.color }}>
              {col.icon || '📁'}
            </span>
            <h3>{col.name}</h3>
          </div>
          {col.description && (
            <p className="collection-description">{col.description}</p>
          )}
          <div className="collection-actions">
            <button 
              className="action-btn" 
              onClick={() => handleViewCollection(col.id)}
            >
              View Documents
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}