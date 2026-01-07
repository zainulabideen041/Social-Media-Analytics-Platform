import { Request } from 'express';

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  params: any;
  query: any;
  body: any;
}

export type Platform = 'twitter' | 'facebook' | 'instagram' | 'linkedin';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type UserRole = 'admin' | 'user';
export type TimeGranularity = 'hourly' | 'daily' | 'weekly';
