import { Injectable, signal } from '@angular/core';
import { Message, createMessage } from '../models/message.model';
import { StorageService } from './storage.service';

/**
 * Message Service
 * Following Single Responsibility Principle (SRP)
 * Manages messages state and persistence
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly STORAGE_KEY = 'legichat_messages';

  // Using Angular Signals for reactive state management
  private messagesSignal = signal<Message[]>([]);

  messages = this.messagesSignal.asReadonly();

  constructor(private storageService: StorageService<Message[]>) {
    this.loadMessages();
  }

  /**
   * Load messages from storage
   */
  private loadMessages(): void {
    const stored = this.storageService.get(this.STORAGE_KEY);
    if (stored) {
      this.messagesSignal.set(stored);
    }
  }

  /**
   * Save messages to storage
   */
  private saveMessages(): void {
    this.storageService.set(this.STORAGE_KEY, this.messagesSignal());
  }

  /**
   * Get messages for a specific conversation
   */
  getConversationMessages(conversationId: string): Message[] {
    return this.messagesSignal().filter(msg => msg.conversationId === conversationId);
  }

  /**
   * Add a new message
   */
  addMessage(conversationId: string, content: string, role: 'user' | 'assistant'): Message {
    const newMessage = createMessage(conversationId, content, role);
    this.messagesSignal.update(messages => [...messages, newMessage]);
    this.saveMessages();
    return newMessage;
  }

  /**
   * Update message content (useful for streaming responses)
   */
  updateMessage(messageId: string, content: string): void {
    this.messagesSignal.update(messages =>
      messages.map(msg =>
        msg.id === messageId ? { ...msg, content } : msg
      )
    );
    this.saveMessages();
  }

  /**
   * Update message with complete data from API response
   */
  updateMessageFromResponse(messageId: string, response: Partial<Message>): void {
    this.messagesSignal.update(messages =>
      messages.map(msg =>
        msg.id === messageId ? { ...msg, ...response } : msg
      )
    );
    this.saveMessages();
  }

  /**
   * Set message loading state
   */
  setMessageLoading(messageId: string, isLoading: boolean): void {
    this.messagesSignal.update(messages =>
      messages.map(msg =>
        msg.id === messageId ? { ...msg, isLoading } : msg
      )
    );
  }

  /**
   * Delete a specific message by ID
   */
  deleteMessage(messageId: string): void {
    this.messagesSignal.update(messages =>
      messages.filter(msg => msg.id !== messageId)
    );
    this.saveMessages();
  }

  /**
   * Delete messages for a conversation
   */
  deleteConversationMessages(conversationId: string): void {
    this.messagesSignal.update(messages =>
      messages.filter(msg => msg.conversationId !== conversationId)
    );
    this.saveMessages();
  }

  /**
   * Clear all messages
   */
  clearAllMessages(): void {
    this.messagesSignal.set([]);
    this.saveMessages();
  }
}
