import React, { useState, FormEvent } from 'react';
import InfoPanel from './InfoPanel';

interface ConfigDialogProps {
  onSubmit: (apiKey: string, apiUrl?: string) => Promise<void>;
  error: string | null;
  loading: boolean;
  savedApiUrl?: string;
}

export default function ConfigDialog({ onSubmit, error, loading, savedApiUrl }: ConfigDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(savedApiUrl || '');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      return;
    }
    
    try {
      await onSubmit(apiKey.trim(), apiUrl.trim() || undefined);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      // Error is handled by parent
    }
  };

  return (
    <>
      <div className="config-dialog">
        <InfoPanel />
        <div className="dialog-content">
          <h2>API Configuration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="api-key">API Key *</label>
              <input 
                type="password" 
                id="api-key" 
                placeholder="Your Outline API key" 
                required
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <small>Your API key is never stored and must be provided each session</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="api-url">API URL (optional)</label>
              <input 
                type="url" 
                id="api-url" 
                placeholder="https://app.getoutline.com/api"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <small>Leave empty to use the default Outline API URL</small>
              <small style={{ color: '#ea4335', display: 'block', marginTop: '0.5rem' }}>
                ⚠️ Note: Outline SaaS (app.getoutline.com) does not allow direct browser access due to CORS policy.
              </small>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
      
      {showSuccess && (
        <div className="toast success">
          Connected to Outline API successfully!
        </div>
      )}
    </>
  );
}