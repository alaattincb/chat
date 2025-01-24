import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material Modülleri
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

import { ChatService } from '../../../services/chat.service';
import { Group } from '../../../types/chat.types';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit {
  groups: Group[] = [];
  loading = false;
  showCreateForm = false;
  createGroupForm: FormGroup;

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder
  ) {
    this.createGroupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.chatService.getUserGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createGroup(): void {
    if (this.createGroupForm.valid) {
      this.loading = true;
      const { name, description } = this.createGroupForm.value;
      
      this.chatService.createGroup(name, description).subscribe({
        next: () => {
          this.loadGroups();
          this.showCreateForm = false;
          this.createGroupForm.reset();
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createGroupForm.reset();
    }
  }

  isGroupAdmin(group: Group): boolean {
    return group.members.some(member => 
      member.role === 'admin' && member.user._id === localStorage.getItem('userId')
    );
  }

  getMemberCount(group: Group): number {
    return group.members.length;
  }

  getOnlineMemberCount(group: Group): number {
    return group.members.filter(member => member.user.isOnline).length;
  }
}
