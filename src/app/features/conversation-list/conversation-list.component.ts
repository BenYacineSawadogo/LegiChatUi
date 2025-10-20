import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService } from '../../core/services/conversation.service';
import { Conversation } from '../../core/models/conversation.model';

/**
 * Conversation List Component
 * Displays sidebar with list of conversations
 */
@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent {
  private conversationService = inject(ConversationService);

  conversations = this.conversationService.conversations;
  activeConversationId = this.conversationService.activeConversationId;

  /**
   * Create a new conversation
   */
  onNewConversation(): void {
    this.conversationService.createNewConversation();
  }

  /**
   * Select a conversation
   */
  onSelectConversation(conversationId: string): void {
    this.conversationService.setActiveConversation(conversationId);
  }

  /**
   * Delete a conversation
   */
  onDeleteConversation(event: Event, conversationId: string): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      this.conversationService.deleteConversation(conversationId);
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return messageDate.toLocaleDateString('fr-FR');
    }
  }
}
