import React, { useState, FormEvent } from 'react';
import type { OutlineClient, DocumentSearchResult } from 'outline-api-client';

interface SearchViewProps {
  client: OutlineClient;
}

export default function SearchView({ client }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocumentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await client.documents.search(query, { limit: 10 });
      setResults(response.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h2>Search Documents</h2>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          className="search-input"
          placeholder="Enter search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      <div id="search-results">
        {loading ? (
          <p>Searching...</p>
        ) : searched && results.length === 0 ? (
          <p className="empty-state">No results found</p>
        ) : results.length > 0 ? (
          <>
            <h3>Search Results ({results.length})</h3>
            {results.map(doc => (
              <div key={doc.id} className="search-result">
                <h4>{doc.title}</h4>
                {doc.context && (
                  <p className="search-context">{doc.context}</p>
                )}
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}