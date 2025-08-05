import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/client.js';
import { printError, printSuccess, printInfo } from '../utils/output.js';

export function authCommand() {
  const auth = new Command('auth')
    .description('Authentication and user information');

  // Get auth info
  auth
    .command('info')
    .description('Get current user and team information')
    .action(async (options, command) => {
      const spinner = ora('Fetching auth info...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.auth.info();

        spinner.stop();

        if (!response.data) {
          printError('Failed to get auth info');
          return;
        }

        const { user, team } = response.data;

        console.log(chalk.bold('\n👤 User Information:'));
        console.log(chalk.gray('  Name:'), user.name);
        console.log(chalk.gray('  Email:'), user.email);
        console.log(chalk.gray('  Admin:'), user.isAdmin ? chalk.green('Yes') : chalk.gray('No'));
        console.log(chalk.gray('  Status:'), user.isSuspended ? chalk.red('Suspended') : chalk.green('Active'));

        console.log(chalk.bold('\n🏢 Team Information:'));
        console.log(chalk.gray('  Name:'), team.name);
        console.log(chalk.gray('  Subdomain:'), team.subdomain || 'None');
        console.log(chalk.gray('  Sharing:'), team.sharing ? 'Enabled' : 'Disabled');
        console.log(chalk.gray('  Guest Signin:'), team.guestSignin ? 'Enabled' : 'Disabled');
        console.log();
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // Test connection
  auth
    .command('test')
    .description('Test API connection')
    .action(async (options, command) => {
      const spinner = ora('Testing connection...').start();
      try {
        const client = getClient(command.parent);
        const isConnected = await client.ping();

        spinner.stop();

        if (isConnected) {
          printSuccess('Successfully connected to Outline API!');
          
          // Get additional info
          const authInfo = await client.auth.info();
          if (authInfo.data) {
            console.log(chalk.gray(`  User: ${authInfo.data.user.name}`));
            console.log(chalk.gray(`  Team: ${authInfo.data.team.name}`));
          }
        } else {
          printError('Failed to connect to Outline API');
        }
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // List API keys
  auth
    .command('keys')
    .description('List API keys')
    .action(async (options, command) => {
      const spinner = ora('Fetching API keys...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.auth.apiKeys();

        spinner.stop();

        if (!response.data || response.data.length === 0) {
          printInfo('No API keys found');
          return;
        }

        console.log(chalk.bold(`\nFound ${response.data.length} API keys:\n`));
        response.data.forEach(key => {
          console.log(chalk.blue('🔑 Key:'), chalk.bold(key.name));
          console.log(chalk.gray('  ID:'), key.id);
          console.log(chalk.gray('  Created:'), new Date(key.createdAt).toLocaleString());
          if (key.lastActiveAt) {
            console.log(chalk.gray('  Last Active:'), new Date(key.lastActiveAt).toLocaleString());
          }
          console.log();
        });
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  return auth;
}