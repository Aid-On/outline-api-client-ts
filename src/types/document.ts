import type { Entity, Timestamps, UserReference } from './common';

export interface Document extends Entity, Timestamps {
  url: string;
  urlId: string;
  title: string;
  text: string;
  html?: string;
  data?: Record<string, unknown>;
  emoji?: string;
  collectionId: string;
  parentDocumentId?: string;
  revision: number;
  fullWidth?: boolean;
  createdBy: UserReference;
  updatedBy: UserReference;
  publishedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  teamId: string;
  template?: boolean;
  templateId?: string;
  collaboratorIds?: string[];
}

export interface CreateDocumentData {
  title: string;
  text: string;
  collectionId: string;
  parentDocumentId?: string;
  template?: boolean;
  templateId?: string;
  publish?: boolean;
  emoji?: string;
  fullWidth?: boolean;
}

export interface UpdateDocumentData {
  title?: string;
  text?: string;
  emoji?: string;
  fullWidth?: boolean;
  append?: boolean;
  publish?: boolean;
  done?: boolean;
}

export interface MoveDocumentData {
  parentDocumentId?: string;
  collectionId?: string;
  index?: number;
}

export type ExportFormat = 'markdown' | 'html' | 'pdf';

export interface DocumentSearchResult extends Document {
  context?: string;
  highlight?: string;
}

export interface DocumentListOptions {
  collectionId?: string;
  parentDocumentId?: string;
  backlinkDocumentId?: string;
  sort?: 'title' | 'updatedAt' | 'createdAt' | 'publishedAt';
  direction?: 'ASC' | 'DESC';
  template?: boolean;
}