import { User } from './user.model';

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: User[];
  admins: string[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    sender: User;
    createdAt: string;
  };
} 