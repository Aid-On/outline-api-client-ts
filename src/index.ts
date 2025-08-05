export { OutlineClient } from './client';
export { createOutlineClient } from './factory';

export type {
  OutlineClientOptions,
  ApiResponse,
  PaginationOptions,
  SearchOptions,
} from './types';

export type {
  Document,
  CreateDocumentData,
  UpdateDocumentData,
  ExportFormat,
} from './types/document';

export type {
  Collection,
  CreateCollectionData,
  UpdateCollectionData,
} from './types/collection';

export type {
  User,
  AuthInfo,
} from './types/auth';

export { OutlineAPIError } from './utils/error';