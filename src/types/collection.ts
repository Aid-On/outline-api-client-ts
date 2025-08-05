import type { Entity, Timestamps, UserReference } from './common';

export interface Collection extends Entity, Timestamps {
  name: string;
  description?: string;
  url: string;
  urlId: string;
  color: string;
  icon?: string;
  sort: Sort;
  index: string;
  permission?: Permission;
  sharing: boolean;
  createdBy: UserReference;
  updatedBy: UserReference;
  documents?: CollectionDocument[];
}

export interface CollectionDocument {
  id: string;
  title: string;
  url: string;
  publishedAt?: string;
}

export type Sort = {
  field: 'title' | 'index';
  direction: 'asc' | 'desc';
};

export type Permission = 'read' | 'read_write' | 'admin';

export interface CreateCollectionData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  permission?: Permission;
  sharing?: boolean;
  sort?: Sort;
  index?: string;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  permission?: Permission;
  sharing?: boolean;
  sort?: Sort;
}

export interface CollectionMembership {
  id: string;
  userId: string;
  collectionId: string;
  permission: Permission;
  createdAt: string;
  updatedAt: string;
  user?: UserReference;
}

export interface CollectionGroup {
  id: string;
  groupId: string;
  collectionId: string;
  permission: Permission;
  createdAt: string;
  updatedAt: string;
}