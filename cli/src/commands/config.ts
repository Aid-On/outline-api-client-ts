import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { printSuccess, printError, printInfo } from '../utils/output.js';

const CONFIG_DIR = path.join(os.homedir(), '.oln');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface Config {
  apiKey?: string;
  apiUrl?: string;
}

async function loadConfig(): Promise<Config> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveConfig(config: Config): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function configCommand() {
  const config = new Command('config')
    .description('Manage CLI configuration');

  // Set configuration
  config
    .command('set')
    .description('Set configuration values')
    .action(async () => {
      try {
        const currentConfig = await loadConfig();

        const answers = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: 'API Key:',
            mask: '*',
            validate: (input) => input.trim().length > 0 || 'API key is required',
          },
          {
            type: 'input',
            name: 'apiUrl',
            message: 'API URL (optional):',
            default: currentConfig.apiUrl || 'https://app.getoutline.com/api',
          },
        ]);

        await saveConfig({
          apiKey: answers.apiKey,
          apiUrl: answers.apiUrl,
        });

        printSuccess('Configuration saved successfully!');
        printInfo(`Config file: ${CONFIG_FILE}`);
        
        console.log(chalk.yellow('\nYou can now use the CLI without specifying --api-key'));
        console.log(chalk.gray('Or set OUTLINE_API_KEY environment variable'));
      } catch (error) {
        printError(error);
      }
    });

  // Show configuration
  config
    .command('show')
    .description('Show current configuration')
    .action(async () => {
      try {
        const currentConfig = await loadConfig();

        console.log(chalk.bold('\nCurrent Configuration:'));
        console.log(chalk.gray('  Config file:'), CONFIG_FILE);
        console.log(chalk.gray('  API URL:'), currentConfig.apiUrl || 'Not set');
        console.log(chalk.gray('  API Key:'), currentConfig.apiKey ? chalk.green('✓ Set') : chalk.red('✗ Not set'));
        
        // Check environment variables
        console.log(chalk.bold('\nEnvironment Variables:'));
        console.log(chalk.gray('  OUTLINE_API_KEY:'), process.env.OUTLINE_API_KEY ? chalk.green('✓ Set') : chalk.gray('Not set'));
        console.log(chalk.gray('  OUTLINE_API_URL:'), process.env.OUTLINE_API_URL || chalk.gray('Not set'));
        
        console.log(chalk.bold('\nPriority Order:'));
        console.log(chalk.gray('  1. Command line flags (--api-key, --api-url)'));
        console.log(chalk.gray('  2. Environment variables (OUTLINE_API_KEY, OUTLINE_API_URL)'));
        console.log(chalk.gray('  3. Config file (~/.oln/config.json)'));
      } catch (error) {
        printError(error);
      }
    });

  // Clear configuration
  config
    .command('clear')
    .description('Clear saved configuration')
    .action(async () => {
      try {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to clear the configuration?',
            default: false,
          },
        ]);

        if (!confirm) {
          printInfo('Configuration not cleared');
          return;
        }

        await fs.unlink(CONFIG_FILE).catch(() => {});
        printSuccess('Configuration cleared!');
      } catch (error) {
        printError(error);
      }
    });

  return config;
}