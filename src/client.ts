import type { OutlineClientOptions } from './types';
import { DocumentsAPI } from './resources/documents';
import { CollectionsAPI } from './resources/collections';
import { AuthAPI } from './resources/auth';
import { HttpClient } from './utils/request';

export class OutlineClient {
  private readonly httpClient: HttpClient;
  
  public readonly documents: DocumentsAPI;
  public readonly collections: CollectionsAPI;
  public readonly auth: AuthAPI;

  constructor(options: OutlineClientOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    this.httpClient = new HttpClient({
      apiKey: options.apiKey,
      apiUrl: options.apiUrl || 'https://app.getoutline.com/api',
      timeout: options.timeout,
      retryAttempts: options.retryAttempts,
      retryDelay: options.retryDelay,
      fetchImplementation: options.fetchImplementation,
    });

    this.documents = new DocumentsAPI(this.httpClient);
    this.collections = new CollectionsAPI(this.httpClient);
    this.auth = new AuthAPI(this.httpClient);
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.auth.info();
      return response.ok;
    } catch {
      return false;
    }
  }
}