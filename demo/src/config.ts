export interface Config {
  apiKey: string;
  apiUrl?: string;
}

export class ConfigManager {
  private readonly STORAGE_KEY = 'outline-api-demo-config';

  save(config: Config): void {
    // Only save the API URL, not the API key for security
    const safeConfig = {
      apiUrl: config.apiUrl,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safeConfig));
  }

  load(): Config | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const config = JSON.parse(stored);
      // API key must be provided each time
      return null;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getSavedApiUrl(): string | undefined {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return undefined;
    
    try {
      const config = JSON.parse(stored);
      return config.apiUrl;
    } catch {
      return undefined;
    }
  }
}