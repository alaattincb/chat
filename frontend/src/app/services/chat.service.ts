import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { User, Message, Group, GroupMessage } from '../types/chat.types';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = environment.apiUrl;
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(this.API_URL, {
      autoConnect: false
    });

    this.socket.on('connect', () => {
      console.log('Socket bağlantısı başarılı');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket bağlantısı kesildi');
    });
  }

  // Socket olaylarını dinle
  onNewPrivateMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('new_private_message', (message: Message) => {
        observer.next(message);
      });
    });
  }

  onNewGroupMessage(): Observable<GroupMessage> {
    return new Observable(observer => {
      this.socket.on('new_group_message', (message: GroupMessage) => {
        observer.next(message);
      });
    });
  }

  onUserStatusChange(): Observable<{userId: string, status: 'online' | 'offline'}> {
    return new Observable(observer => {
      this.socket.on('user_status_change', (data) => {
        observer.next(data);
      });
    });
  }

  connect(userId: string): void {
    this.socket.connect();
    this.socket.emit('user_connected', userId);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  // Kullanıcı işlemleri
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users/search`, {
      params: { q: query }
    });
  }

  // Özel mesaj işlemleri
  sendPrivateMessage(receiverId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.API_URL}/messages/private`, {
      receiverId,
      content
    });
  }

  getPrivateMessages(userId: string, page: number = 1): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.API_URL}/messages/private/${userId}?page=${page}`
    );
  }

  // Grup mesaj işlemleri
  sendGroupMessage(groupId: string, content: string): Observable<GroupMessage> {
    return this.http.post<GroupMessage>(`${this.API_URL}/messages/group`, {
      groupId,
      content
    });
  }

  getGroupMessages(groupId: string, page: number = 1): Observable<GroupMessage[]> {
    return this.http.get<GroupMessage[]>(
      `${this.API_URL}/messages/group/${groupId}?page=${page}`
    );
  }

  // Grup işlemleri
  createGroup(name: string, description?: string): Observable<Group> {
    return this.http.post<Group>(`${this.API_URL}/groups`, {
      name,
      description
    });
  }

  getUserGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.API_URL}/groups`);
  }

  getGroupDetails(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.API_URL}/groups/${groupId}`);
  }

  addMemberToGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.API_URL}/groups/${groupId}/members`, {
      userId
    });
  }

  removeMemberFromGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(
      `${this.API_URL}/groups/${groupId}/members/${userId}`
    );
  }

  joinGroup(groupId: string): void {
    if (this.socket) {
      this.socket.emit('joinGroup', { groupId });
    }
  }

  leaveGroup(groupId: string): void {
    if (this.socket) {
      this.socket.emit('leaveGroup', { groupId });
    }
  }

  // Mesaj durumu işlemleri
  markMessageAsRead(messageId: string): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/messages/${messageId}/read`,
      {}
    );
  }
} 