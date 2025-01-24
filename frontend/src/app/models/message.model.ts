import { User } from './user.model';

export interface Message {
  id: string;
  content: string;
  sender: User;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  readBy?: string[];
} 