import { Component } from '@angular/core';
import { ConversationListComponent } from './features/conversation-list/conversation-list.component';
import { ChatComponent } from './features/chat/chat.component';

/**
 * Main Application Component
 * Root component that orchestrates the chat interface
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConversationListComponent, ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
