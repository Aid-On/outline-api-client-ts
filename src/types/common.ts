export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
}

export interface UserReference {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

export interface Revision {
  id: string;
  title: string;
  text: string;
  html?: string;
  createdAt: string;
  createdBy: UserReference;
}