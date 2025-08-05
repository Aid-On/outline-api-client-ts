import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getClient } from '../utils/client.js';
import { printCollection, printDocument, printError, printSuccess, printInfo } from '../utils/output.js';

export function collectionsCommand() {
  const collections = new Command('collections')
    .description('Manage collections')
    .alias('cols');

  // List collections
  collections
    .command('list')
    .description('List all collections')
    .action(async (options, command) => {
      const spinner = ora('Fetching collections...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.collections.list();

        spinner.stop();

        if (!response.data || response.data.length === 0) {
          printInfo('No collections found');
          return;
        }

        console.log(chalk.bold(`\nFound ${response.data.length} collections:\n`));
        response.data.forEach(printCollection);
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // Get collection info
  collections
    .command('info <id>')
    .description('Get collection information')
    .action(async (id, options, command) => {
      const spinner = ora('Fetching collection...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.collections.info(id);

        spinner.stop();

        if (!response.data) {
          printError('Collection not found');
          return;
        }

        printCollection(response.data);
        console.log(chalk.gray('  Color:'), response.data.color);
        console.log(chalk.gray('  Icon:'), response.data.icon || 'None');
        console.log(chalk.gray('  Permission:'), response.data.permission);
        console.log(chalk.gray('  Sharing:'), response.data.sharing ? 'Enabled' : 'Disabled');
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // List documents in collection
  collections
    .command('docs <id>')
    .description('List documents in a collection')
    .option('-l, --limit <number>', 'Limit number of results', '10')
    .action(async (id, options, command) => {
      const spinner = ora('Fetching documents...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.collections.documents(id, {
          limit: parseInt(options.limit),
        });

        spinner.stop();

        if (!response.data || response.data.length === 0) {
          printInfo('No documents found in this collection');
          return;
        }

        console.log(chalk.bold(`\nFound ${response.data.length} documents:\n`));
        response.data.forEach(printDocument);
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // Create collection
  collections
    .command('create')
    .description('Create a new collection')
    .option('-n, --name <name>', 'Collection name')
    .option('-d, --description <description>', 'Collection description')
    .option('-c, --color <color>', 'Collection color (hex)', '#4285F4')
    .action(async (options, command) => {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Collection name:',
            when: !options.name,
            validate: (input) => input.trim().length > 0,
          },
          {
            type: 'input',
            name: 'description',
            message: 'Collection description (optional):',
            when: !options.description,
          },
          {
            type: 'list',
            name: 'permission',
            message: 'Default permission:',
            choices: ['read', 'read_write', 'admin'],
            default: 'read_write',
          },
          {
            type: 'confirm',
            name: 'sharing',
            message: 'Enable sharing?',
            default: true,
          },
        ]);

        const spinner = ora('Creating collection...').start();
        const client = getClient(command.parent);

        const response = await client.collections.create({
          name: options.name || answers.name,
          description: options.description || answers.description,
          color: options.color,
          permission: answers.permission,
          sharing: answers.sharing,
        });

        spinner.stop();
        printSuccess('Collection created successfully!');
        printCollection(response.data!);
      } catch (error) {
        printError(error);
      }
    });

  // Update collection
  collections
    .command('update <id>')
    .description('Update a collection')
    .option('-n, --name <name>', 'New name')
    .option('-d, --description <description>', 'New description')
    .action(async (id, options, command) => {
      try {
        const client = getClient(command.parent);

        // Fetch current collection
        const currentCol = await client.collections.info(id);
        if (!currentCol.data) {
          printError('Collection not found');
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'New name:',
            default: currentCol.data.name,
            when: !options.name,
          },
          {
            type: 'input',
            name: 'description',
            message: 'New description:',
            default: currentCol.data.description,
            when: !options.description,
          },
        ]);

        const spinner = ora('Updating collection...').start();

        const response = await client.collections.update(id, {
          name: options.name || answers.name,
          description: options.description || answers.description,
        });

        spinner.stop();
        printSuccess('Collection updated successfully!');
        printCollection(response.data!);
      } catch (error) {
        printError(error);
      }
    });

  // Delete collection
  collections
    .command('delete <id>')
    .description('Delete a collection')
    .action(async (id, options, command) => {
      try {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.red('Are you sure you want to delete this collection? All documents will be moved to trash.'),
            default: false,
          },
        ]);

        if (!confirm) {
          printInfo('Deletion cancelled');
          return;
        }

        const spinner = ora('Deleting collection...').start();
        const client = getClient(command.parent);

        await client.collections.delete(id);

        spinner.stop();
        printSuccess('Collection deleted successfully!');
      } catch (error) {
        printError(error);
      }
    });

  // Export collection
  collections
    .command('export <id>')
    .description('Export a collection')
    .option('-f, --format <format>', 'Export format (outline-markdown, json)', 'outline-markdown')
    .action(async (id, options, command) => {
      const spinner = ora('Exporting collection...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.collections.export(id, options.format);

        spinner.stop();

        if (!response.data) {
          printError('Failed to export collection');
          return;
        }

        printSuccess(`Export started! Download URL: ${response.data.fileUrl}`);
        printInfo('The export will be available for download when processing is complete.');
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  return collections;
}