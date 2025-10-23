import { Injectable, signal, computed } from '@angular/core';
import { Conversation, createConversation } from '../models/conversation.model';
import { StorageService } from './storage.service';

/**
 * Conversation Service
 * Following Single Responsibility Principle (SRP)
 * Manages conversations state and persistence
 */
@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly STORAGE_KEY = 'legichat_conversations';

  // Using Angular Signals for reactive state management
  private conversationsSignal = signal<Conversation[]>([]);
  private activeConversationIdSignal = signal<string | null>(null);

  // Computed values
  conversations = this.conversationsSignal.asReadonly();
  activeConversationId = this.activeConversationIdSignal.asReadonly();

  activeConversation = computed(() => {
    const id = this.activeConversationIdSignal();
    return this.conversationsSignal().find(conv => conv.id === id) || null;
  });

  constructor(private storageService: StorageService<Conversation[]>) {
    this.loadConversations();
  }

  /**
   * Load conversations from storage
   */
  private loadConversations(): void {
    const stored = this.storageService.get(this.STORAGE_KEY);
    if (stored && stored.length > 0) {
      this.conversationsSignal.set(stored);
      this.activeConversationIdSignal.set(stored[0].id);
    }
    // Don't create initial conversation automatically
    // User must click "New Chat" button to start
  }

  /**
   * Save conversations to storage
   */
  private saveConversations(): void {
    this.storageService.set(this.STORAGE_KEY, this.conversationsSignal());
  }

  /**
   * Create a new conversation
   */
  createNewConversation(title?: string): Conversation {
    const newConversation = createConversation(title);
    this.conversationsSignal.update(conversations => [newConversation, ...conversations]);
    this.activeConversationIdSignal.set(newConversation.id);
    this.saveConversations();
    return newConversation;
  }

  /**
   * Set active conversation
   */
  setActiveConversation(conversationId: string): void {
    const exists = this.conversationsSignal().some(conv => conv.id === conversationId);
    if (exists) {
      this.activeConversationIdSignal.set(conversationId);
    }
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): void {
    this.conversationsSignal.update(conversations =>
      conversations.filter(conv => conv.id !== conversationId)
    );

    // If deleted conversation was active, select another one
    if (this.activeConversationIdSignal() === conversationId) {
      const remaining = this.conversationsSignal();
      this.activeConversationIdSignal.set(remaining.length > 0 ? remaining[0].id : null);

      // Create new conversation if none left
      if (remaining.length === 0) {
        this.createNewConversation();
      }
    }

    this.saveConversations();
  }

  /**
   * Update conversation title
   */
  updateConversationTitle(conversationId: string, title: string): void {
    this.conversationsSignal.update(conversations =>
      conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, title, updatedAt: new Date() }
          : conv
      )
    );
    this.saveConversations();
  }

  /**
   * Update conversation preview (first message)
   */
  updateConversationPreview(conversationId: string, preview: string): void {
    this.conversationsSignal.update(conversations =>
      conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, preview, updatedAt: new Date() }
          : conv
      )
    );
    this.saveConversations();
  }
}
