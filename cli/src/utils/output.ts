import chalk from 'chalk';
import { Document, Collection } from 'outline-api-client';

export function printDocument(doc: Document) {
  console.log(chalk.blue('📄 Document:'), chalk.bold(doc.title));
  console.log(chalk.gray('  ID:'), doc.id);
  console.log(chalk.gray('  Updated:'), new Date(doc.updatedAt).toLocaleString());
  if (doc.publishedAt) {
    console.log(chalk.green('  Status: Published'));
  } else {
    console.log(chalk.yellow('  Status: Draft'));
  }
  console.log();
}

export function printCollection(collection: Collection) {
  console.log(chalk.blue('📁 Collection:'), chalk.bold(collection.name));
  console.log(chalk.gray('  ID:'), collection.id);
  if (collection.description) {
    console.log(chalk.gray('  Description:'), collection.description);
  }
  console.log();
}

export function printError(error: any) {
  if (error.response) {
    console.error(chalk.red('API Error:'), error.response.status, error.response.statusText);
    if (error.response.data?.message) {
      console.error(chalk.red('Message:'), error.response.data.message);
    }
  } else if (error.message) {
    console.error(chalk.red('Error:'), error.message);
  } else {
    console.error(chalk.red('Unknown error occurred'));
    console.error(error);
  }
}

export function printSuccess(message: string) {
  console.log(chalk.green('✓'), message);
}

export function printWarning(message: string) {
  console.log(chalk.yellow('⚠'), message);
}

export function printInfo(message: string) {
  console.log(chalk.blue('ℹ'), message);
}