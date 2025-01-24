export interface User {
  _id: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface BaseMessage {
  _id: string;
  sender: User;
  content: string;
  type: 'private' | 'group';
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMessage extends BaseMessage {
  type: 'group';
  group: Group;
  readBy: ReadStatus[];
}

export interface PrivateMessage extends BaseMessage {
  type: 'private';
  receiver: User;
  readBy: ReadStatus[];
}

export type Message = GroupMessage | PrivateMessage;

export interface Group {
  _id: string;
  name: string;
  description?: string;
  creator: User;
  members: GroupMember[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  user: User;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface ReadStatus {
  user: User;
  readAt: Date;
} 