import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Angular Material Modülleri
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChatService } from '../../../services/chat.service';
import { Message, User } from '../../../types/chat.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  recipient?: User;
  messages: Message[] = [];
  loading = false;
  messageInput = new FormControl('');
  private subscriptions: Subscription[] = [];
  private currentPage = 1;
  private hasMoreMessages = true;
  private messageSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['userId']) {
        this.loadMessages(params['userId']);
        this.listenToNewMessages();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  private loadRecipient(userId: string): void {
    // Burada kullanıcı bilgilerini yükleyeceğiz
  }

  private loadMessages(userId: string, page: number = 1): void {
    if (this.loading || !this.hasMoreMessages) return;

    this.loading = true;
    this.chatService.getPrivateMessages(userId, page).subscribe({
      next: (messages) => {
        if (messages.length === 0) {
          this.hasMoreMessages = false;
        } else {
          if (page === 1) {
            this.messages = messages;
          } else {
            this.messages = [...messages, ...this.messages];
          }
          this.currentPage = page;
        }
        this.loading = false;
        if (page === 1) {
          this.scrollToBottom();
        }
      },
      error: (error) => {
        console.error('Mesajlar yüklenirken hata:', error);
        this.loading = false;
      }
    });
  }

  private listenToNewMessages(): void {
    this.messageSubscription = this.chatService.onNewPrivateMessage().subscribe({
      next: (message: Message) => {
        this.messages.push(message);
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Yeni mesajlar dinlenirken hata:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.messageInput.value?.trim() || !this.recipient) return;

    this.chatService.sendPrivateMessage(this.recipient._id, this.messageInput.value.trim()).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.messageInput.reset();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Mesaj gönderilirken hata:', error);
      }
    });
  }

  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollTop === 0 && !this.loading && this.hasMoreMessages) {
      this.loadMessages(this.recipient?._id || '', this.currentPage + 1);
    }
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop = 
          this.messageContainer.nativeElement.scrollHeight;
      });
    } catch (err) {}
  }

  isOwnMessage(message: Message): boolean {
    return message.sender._id === localStorage.getItem('userId');
  }

  getMessageTime(date: Date): string {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 