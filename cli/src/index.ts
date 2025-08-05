#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { documentsCommand } from './commands/documents.js';
import { collectionsCommand } from './commands/collections.js';
import { authCommand } from './commands/auth.js';
import { configCommand } from './commands/config.js';

// Load environment variables
config();

const program = new Command();

program
  .name('oln')
  .description('CLI tool for Outline API')
  .version('1.0.0')
  .option('-k, --api-key <key>', 'API key (can also use OUTLINE_API_KEY env var)')
  .option('-u, --api-url <url>', 'API URL (default: https://app.getoutline.com/api)')
  .hook('preAction', (thisCommand) => {
    // Ensure API key is available
    const apiKey = thisCommand.opts().apiKey || process.env.OUTLINE_API_KEY;
    if (!apiKey && thisCommand.args[0] !== 'config') {
      console.error(chalk.red('Error: API key is required'));
      console.error(chalk.yellow('Use --api-key flag or set OUTLINE_API_KEY environment variable'));
      console.error(chalk.yellow('Run "oln config" to set up your credentials'));
      process.exit(1);
    }
  });

// Add commands
program.addCommand(documentsCommand());
program.addCommand(collectionsCommand());
program.addCommand(authCommand());
program.addCommand(configCommand());

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}