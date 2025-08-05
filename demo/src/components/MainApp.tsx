import React, { useState, useEffect } from 'react';
import type { OutlineClient, Document, Collection } from 'outline-api-client';
import DocumentsList from './DocumentsList';
import CollectionsList from './CollectionsList';
import SearchView from './SearchView';

type ViewType = 'documents' | 'collections' | 'search';

interface MainAppProps {
  client: OutlineClient;
}

export default function MainApp({ client }: MainAppProps) {
  const [currentView, setCurrentView] = useState<ViewType>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsResponse, collectionsResponse] = await Promise.all([
        client.documents.list({ limit: 10 }),
        client.collections.list()
      ]);

      setDocuments(docsResponse.data || []);
      setCollections(collectionsResponse.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main id="main-app">
        <div className="loading">Loading...</div>
      </main>
    );
  }

  return (
    <main id="main-app">
      <div className="demo-container">
        <nav className="demo-nav">
          <button 
            className={`nav-btn ${currentView === 'documents' ? 'active' : ''}`}
            onClick={() => setCurrentView('documents')}
          >
            📄 Documents
          </button>
          <button 
            className={`nav-btn ${currentView === 'collections' ? 'active' : ''}`}
            onClick={() => setCurrentView('collections')}
          >
            📁 Collections
          </button>
          <button 
            className={`nav-btn ${currentView === 'search' ? 'active' : ''}`}
            onClick={() => setCurrentView('search')}
          >
            🔍 Search
          </button>
        </nav>
        
        <div className="demo-content">
          {currentView === 'documents' && (
            <DocumentsList documents={documents} client={client} />
          )}
          {currentView === 'collections' && (
            <CollectionsList collections={collections} client={client} />
          )}
          {currentView === 'search' && (
            <SearchView client={client} />
          )}
        </div>
      </div>
    </main>
  );
}