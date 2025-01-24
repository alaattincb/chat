import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ChatListComponent } from './components/chat/chat-list/chat-list.component';
import { ChatWindowComponent } from './components/chat/chat-window/chat-window.component';
import { GroupListComponent } from './components/chat/group-list/group-list.component';
import { GroupChatWindowComponent } from './components/chat/group-chat-window/group-chat-window.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'chat',
    component: ChatListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'chat/:userId',
    component: ChatWindowComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'groups',
    component: GroupListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'groups/:groupId',
    component: GroupChatWindowComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/chat' }
];
