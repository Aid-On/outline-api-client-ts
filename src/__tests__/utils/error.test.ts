import { describe, it, expect } from 'vitest';
import { OutlineAPIError } from '../../utils/error';

describe('OutlineAPIError', () => {
  it('should create error with message and status', () => {
    const error = new OutlineAPIError('Test error', 404);
    
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.name).toBe('OutlineAPIError');
  });

  it('should create error from response', () => {
    const error = OutlineAPIError.fromResponse(400, {
      error: 'validation_error',
      message: 'Invalid input',
      data: { field: 'title' },
    });
    
    expect(error.message).toBe('Invalid input');
    expect(error.status).toBe(400);
    expect(error.code).toBe('validation_error');
    expect(error.data).toEqual({ field: 'title' });
  });

  it('should create error with default message', () => {
    const error = OutlineAPIError.fromResponse(500);
    
    expect(error.message).toBe('API request failed with status 500');
    expect(error.status).toBe(500);
  });

  describe('error type checks', () => {
    it('should identify rate limit errors', () => {
      const error = new OutlineAPIError('Rate limit', 429);
      expect(error.isRateLimitError()).toBe(true);
      expect(error.isAuthError()).toBe(false);
    });

    it('should identify auth errors', () => {
      const error401 = new OutlineAPIError('Unauthorized', 401);
      const error403 = new OutlineAPIError('Forbidden', 403);
      
      expect(error401.isAuthError()).toBe(true);
      expect(error403.isAuthError()).toBe(true);
    });

    it('should identify not found errors', () => {
      const error = new OutlineAPIError('Not found', 404);
      expect(error.isNotFoundError()).toBe(true);
    });

    it('should identify validation errors', () => {
      const error = new OutlineAPIError('Bad request', 400);
      expect(error.isValidationError()).toBe(true);
    });

    it('should identify server errors', () => {
      const error500 = new OutlineAPIError('Server error', 500);
      const error503 = new OutlineAPIError('Service unavailable', 503);
      
      expect(error500.isServerError()).toBe(true);
      expect(error503.isServerError()).toBe(true);
    });
  });
});