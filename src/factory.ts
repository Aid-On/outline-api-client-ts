import { OutlineClient } from './client';
import type { OutlineClientOptions } from './types';

export function createOutlineClient(options: OutlineClientOptions): OutlineClient;
export function createOutlineClient(apiKey: string, options?: Partial<OutlineClientOptions>): OutlineClient;
export function createOutlineClient(
  apiKeyOrOptions: string | OutlineClientOptions,
  options?: Partial<OutlineClientOptions>
): OutlineClient {
  if (typeof apiKeyOrOptions === 'string') {
    return new OutlineClient({
      apiKey: apiKeyOrOptions,
      ...options,
    });
  }
  return new OutlineClient(apiKeyOrOptions);
}
