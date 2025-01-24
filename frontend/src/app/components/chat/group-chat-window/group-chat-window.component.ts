import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { Group, GroupMessage } from '../../../types/chat.types';

@Component({
  selector: 'app-group-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './group-chat-window.component.html',
  styleUrls: ['./group-chat-window.component.scss']
})
export class GroupChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  group: Group | null = null;
  messages: GroupMessage[] = [];
  messageInput = new FormControl('');
  loading = false;
  currentPage = 1;
  hasMoreMessages = true;
  showMembersList = false;
  private currentUserId: string = '';
  private subscriptions: Subscription[] = [];
  private messageSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    });

    this.route.params.subscribe(params => {
      const groupId = params['id'];
      if (groupId) {
        this.loadGroup(groupId);
        this.loadMessages(groupId);
        this.chatService.joinGroup(groupId);
        this.listenToNewMessages();
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.group) {
      this.chatService.leaveGroup(this.group._id);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadGroup(groupId: string): void {
    this.loading = true;
    this.chatService.getGroupDetails(groupId).subscribe({
      next: (group) => {
        this.group = group;
        this.loading = false;
      },
      error: (error) => {
        console.error('Grup bilgileri yüklenirken hata:', error);
        this.loading = false;
      }
    });
  }

  private loadMessages(groupId: string): void {
    this.loading = true;
    this.chatService.getGroupMessages(groupId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Mesajlar yüklenirken hata:', error);
        this.loading = false;
      }
    });
  }

  private listenToNewMessages(): void {
    this.messageSubscription = this.chatService.onNewGroupMessage().subscribe({
      next: (message: GroupMessage) => {
        this.messages.push(message);
      },
      error: (error) => {
        console.error('Yeni mesajlar dinlenirken hata:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.messageInput.value?.trim() || !this.group) return;

    this.chatService.sendGroupMessage(this.group._id, this.messageInput.value.trim()).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.messageInput.reset();
      },
      error: (error) => {
        console.error('Mesaj gönderilirken hata:', error);
      }
    });
  }

  loadMoreMessages(): void {
    if (this.group) {
      this.loadMessages(this.group._id);
    }
  }

  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollTop === 0 && !this.loading && this.hasMoreMessages) {
      this.loadMoreMessages();
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = 
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  toggleMembersList(): void {
    this.showMembersList = !this.showMembersList;
  }

  isGroupAdmin(): boolean {
    if (!this.group) return false;
    return this.group.members.some(member => 
      member.role === 'admin' && member.user._id === this.currentUserId
    );
  }

  isOwnMessage(message: GroupMessage): boolean {
    return message.sender._id === this.currentUserId;
  }

  getMessageTime(date: Date): string {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOnlineMembers(): Array<any> {
    if (!this.group) return [];
    return this.group.members
      .filter(member => member.user.isOnline)
      .map(member => member.user);
  }

  getOfflineMembers(): Array<any> {
    if (!this.group) return [];
    return this.group.members
      .filter(member => !member.user.isOnline)
      .map(member => member.user);
  }
}
