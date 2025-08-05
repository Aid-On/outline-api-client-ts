import { createOutlineClient, OutlineClient } from 'outline-api-client';
import chalk from 'chalk';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.oln', 'config.json');

interface Config {
  apiKey?: string;
  apiUrl?: string;
}

export function getClient(command: any): OutlineClient {
  // Priority: CLI flags > env vars > config file
  let apiKey = command.parent.opts().apiKey || process.env.OUTLINE_API_KEY;
  let apiUrl = command.parent.opts().apiUrl || process.env.OUTLINE_API_URL;

  if (!apiKey || !apiUrl) {
    // Try loading from config file synchronously
    // Note: This is not ideal but commander doesn't handle async well here
    try {
      const configData = require('fs').readFileSync(CONFIG_FILE, 'utf-8');
      const config: Config = JSON.parse(configData);
      apiKey = apiKey || config.apiKey;
      apiUrl = apiUrl || config.apiUrl || 'https://app.getoutline.com/api';
    } catch {
      // Ignore config file errors
    }
  }

  if (!apiKey) {
    console.error(chalk.red('Error: API key is required'));
    console.error(chalk.gray('Provide it via:'));
    console.error(chalk.gray('  - Command flag: -k <key> or --api-key <key>'));
    console.error(chalk.gray('  - Environment variable: OUTLINE_API_KEY'));
    console.error(chalk.gray('  - Config file: oln config set'));
    process.exit(1);
  }

  return createOutlineClient({
    apiKey,
    apiUrl: apiUrl || 'https://aid-on.getoutline.com/api',
  });
}