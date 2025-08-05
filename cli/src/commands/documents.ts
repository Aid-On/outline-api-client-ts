import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getClient } from '../utils/client.js';
import { printDocument, printError, printSuccess, printInfo } from '../utils/output.js';

export function documentsCommand() {
  const docs = new Command('docs')
    .description('Manage documents')
    .alias('documents');

  // List documents
  docs
    .command('list')
    .description('List documents')
    .option('-c, --collection <id>', 'Filter by collection ID')
    .option('-l, --limit <number>', 'Limit number of results', '10')
    .option('-s, --sort <field>', 'Sort by field (title, updatedAt, createdAt)', 'updatedAt')
    .action(async (options, command) => {
      const spinner = ora('Fetching documents...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.documents.list({
          collectionId: options.collection,
          limit: parseInt(options.limit),
          sort: options.sort,
        });

        spinner.stop();
        
        if (!response.data || response.data.length === 0) {
          printInfo('No documents found');
          return;
        }

        console.log(chalk.bold(`\nFound ${response.data.length} documents:\n`));
        response.data.forEach(printDocument);
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // Search documents
  docs
    .command('search <query>')
    .description('Search documents')
    .option('-c, --collection <id>', 'Search within collection')
    .option('-l, --limit <number>', 'Limit number of results', '10')
    .action(async (query, options, command) => {
      const spinner = ora('Searching...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.documents.search(query, {
          collectionId: options.collection,
          limit: parseInt(options.limit),
        });

        spinner.stop();

        if (!response.data || response.data.length === 0) {
          printInfo('No results found');
          return;
        }

        console.log(chalk.bold(`\nFound ${response.data.length} results:\n`));
        response.data.forEach((result: any) => {
          if (result.document) {
            printDocument(result.document);
          } else if (result.id) {
            printDocument(result);
          }
          if (result.context) {
            console.log(chalk.gray('  Context:'), result.context);
            console.log();
          }
        });
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // Get document info
  docs
    .command('info <id>')
    .description('Get document information')
    .action(async (id, options, command) => {
      const spinner = ora('Fetching document...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.documents.info(id);

        spinner.stop();

        if (!response.data) {
          printError('Document not found');
          return;
        }

        printDocument(response.data);
        console.log(chalk.gray('Content preview:'));
        console.log(response.data.text.substring(0, 200) + '...\n');
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  // Create document
  docs
    .command('create')
    .description('Create a new document')
    .option('-t, --title <title>', 'Document title')
    .option('-c, --collection <id>', 'Collection ID')
    .option('-p, --parent <id>', 'Parent document ID')
    .option('--publish', 'Publish immediately')
    .action(async (options, command) => {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Document title:',
            when: !options.title,
            validate: (input) => input.trim().length > 0,
          },
          {
            type: 'input',
            name: 'collectionId',
            message: 'Collection ID:',
            when: !options.collection,
            validate: (input) => input.trim().length > 0,
          },
          {
            type: 'editor',
            name: 'text',
            message: 'Document content (Markdown):',
          },
        ]);

        const spinner = ora('Creating document...').start();
        const client = getClient(command.parent);
        
        const response = await client.documents.create({
          title: options.title || answers.title,
          collectionId: options.collection || answers.collectionId,
          text: answers.text,
          parentDocumentId: options.parent,
          publish: options.publish || false,
        });

        spinner.stop();
        printSuccess('Document created successfully!');
        printDocument(response.data!);
      } catch (error) {
        printError(error);
      }
    });

  // Update document
  docs
    .command('update <id>')
    .description('Update a document')
    .option('-t, --title <title>', 'New title')
    .option('-f, --file <path>', 'Read content from file')
    .option('--publish', 'Publish the document')
    .action(async (id, options, command) => {
      try {
        const client = getClient(command.parent);
        
        // Fetch current document
        const currentDoc = await client.documents.info(id);
        if (!currentDoc.data) {
          printError('Document not found');
          return;
        }

        let contentText = currentDoc.data.text;
        
        // If file is specified, read content from file
        if (options.file) {
          const fs = await import('fs/promises');
          try {
            contentText = await fs.readFile(options.file, 'utf-8');
            printInfo(`Reading content from: ${options.file}`);
          } catch (error) {
            printError(`Failed to read file: ${options.file}`);
            return;
          }
        }

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'New title:',
            default: currentDoc.data.title,
            when: !options.title,
          },
          {
            type: 'editor',
            name: 'text',
            message: 'Edit content:',
            default: contentText,
            when: !options.file,
          },
        ]);

        const spinner = ora('Updating document...').start();
        
        const response = await client.documents.update(id, {
          title: options.title || answers.title,
          text: options.file ? contentText : answers.text,
          publish: options.publish || false,
        });

        spinner.stop();
        printSuccess('Document updated successfully!');
        printDocument(response.data!);
      } catch (error) {
        printError(error);
      }
    });

  // Delete document
  docs
    .command('delete <id>')
    .description('Delete a document')
    .option('--permanent', 'Permanently delete (cannot be restored)')
    .action(async (id, options, command) => {
      try {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: options.permanent 
              ? chalk.red('Are you sure you want to PERMANENTLY delete this document?')
              : 'Are you sure you want to delete this document?',
            default: false,
          },
        ]);

        if (!confirm) {
          printInfo('Deletion cancelled');
          return;
        }

        const spinner = ora('Deleting document...').start();
        const client = getClient(command.parent);
        
        await client.documents.delete(id, options.permanent);

        spinner.stop();
        printSuccess('Document deleted successfully!');
      } catch (error) {
        printError(error);
      }
    });

  // Export document
  docs
    .command('export <id>')
    .description('Export a document')
    .option('-f, --format <format>', 'Export format (markdown, html, pdf)', 'markdown')
    .option('-o, --output <file>', 'Output file')
    .action(async (id, options, command) => {
      const spinner = ora('Exporting document...').start();
      try {
        const client = getClient(command.parent);
        const response = await client.documents.export(id, options.format);
        
        spinner.stop();

        if (!response.data) {
          printError('Failed to export document');
          return;
        }

        const exportData = typeof response.data === 'string' ? response.data : response.data.data;

        if (options.output) {
          const fs = await import('fs/promises');
          await fs.writeFile(options.output, exportData);
          printSuccess(`Document exported to ${options.output}`);
        } else {
          console.log(exportData);
        }
      } catch (error) {
        spinner.stop();
        printError(error);
      }
    });

  return docs;
}