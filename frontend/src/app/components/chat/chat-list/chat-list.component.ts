import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService } from '../../../services/chat.service';
import { User } from '../../../types/chat.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  private statusSubscription?: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.listenToUserStatus();
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.chatService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Kullanıcılar yüklenirken hata:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.chatService.searchUsers(this.searchTerm).subscribe({
        next: (users) => {
          this.users = users;
          this.loading = false;
        },
        error: (error) => {
          console.error('Arama sırasında hata:', error);
          this.loading = false;
        }
      });
    } else {
      this.loadUsers();
    }
  }

  private listenToUserStatus(): void {
    this.statusSubscription = this.chatService.onUserStatusChange().subscribe({
      next: (data: { userId: string; status: 'online' | 'offline' }) => {
        const user = this.users.find(u => u._id === data.userId);
        if (user) {
          user.isOnline = data.status === 'online';
          if (!user.isOnline) {
            user.lastSeen = new Date();
          }
        }
      },
      error: (error) => {
        console.error('Kullanıcı durumu dinlenirken hata:', error);
      }
    });
  }

  getLastSeenText(lastSeen: Date): string {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} dakika önce`;
    } else if (hours < 24) {
      return `${hours} saat önce`;
    } else {
      return `${days} gün önce`;
    }
  }
} 