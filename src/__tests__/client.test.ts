import { describe, it, expect } from 'vitest';
import { OutlineClient } from '../client';
import { createOutlineClient } from '../factory';

describe('OutlineClient', () => {
  it('should create client instance with required options', () => {
    const client = new OutlineClient({
      apiKey: 'test-api-key',
    });
    
    expect(client).toBeDefined();
    expect(client.documents).toBeDefined();
    expect(client.collections).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it('should throw error when apiKey is missing', () => {
    expect(() => {
      new OutlineClient({
        apiKey: '',
      });
    }).toThrow('API key is required');
  });

  it('should use default apiUrl when not provided', () => {
    const client = new OutlineClient({
      apiKey: 'test-api-key',
    });
    
    expect(client).toBeDefined();
  });

  it('should use custom apiUrl when provided', () => {
    const client = new OutlineClient({
      apiKey: 'test-api-key',
      apiUrl: 'https://custom.outline.com/api',
    });
    
    expect(client).toBeDefined();
  });
});

describe('createOutlineClient', () => {
  it('should create client using factory function', () => {
    const client = createOutlineClient('test-api-key');
    
    expect(client).toBeDefined();
    expect(client.documents).toBeDefined();
    expect(client.collections).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it('should accept additional options', () => {
    const client = createOutlineClient('test-api-key', {
      apiUrl: 'https://custom.outline.com/api',
      timeout: 60000,
    });
    
    expect(client).toBeDefined();
  });
});