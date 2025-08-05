import type { Entity } from './common';

export interface User extends Entity {
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin: boolean;
  isSuspended: boolean;
  language?: string;
  lastActiveAt?: string;
  createdAt: string;
}

export interface Team extends Entity {
  name: string;
  avatarUrl?: string;
  sharing: boolean;
  collaborativeEditing: boolean;
  guestSignin: boolean;
  subdomain?: string;
  url?: string;
  defaultUserRole: UserRole;
}

export type UserRole = 'admin' | 'member' | 'viewer';

export interface AuthInfo {
  user: User;
  team: Team;
}

export interface ApiKey {
  id: string;
  name: string;
  secret?: string;
  createdAt: string;
  lastActiveAt?: string;
}