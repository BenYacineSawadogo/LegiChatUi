import { Component, computed, effect, inject, ViewChild, ElementRef, AfterViewChecked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MessageComponent } from '../../shared/components/message/message.component';
import { ChatInputComponent } from '../../shared/components/chat-input/chat-input.component';
import { ConversationService } from '../../core/services/conversation.service';
import { MessageService } from '../../core/services/message.service';
import { ChatApiService } from '../../core/services/chat-api.service';
import { Message } from '../../core/models/message.model';

/**
 * Chat Component
 * Main chat interface component
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, MessageComponent, ChatInputComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild(ChatInputComponent) private chatInput!: ChatInputComponent;

  private conversationService = inject(ConversationService);
  private messageService = inject(MessageService);
  private chatApiService = inject(ChatApiService);

  private shouldScrollToBottom = false;
  private currentSubscription?: Subscription;
  private currentAssistantMessageId?: string;

  activeConversation = this.conversationService.activeConversation;
  isGenerating = signal(false);

  // Computed property to get messages for active conversation
  messages = computed(() => {
    const conversation = this.activeConversation();
    if (!conversation) return [];
    return this.messageService.getConversationMessages(conversation.id);
  });

  constructor() {
    // Effect to scroll when messages change
    effect(() => {
      const msgs = this.messages();
      if (msgs.length > 0) {
        this.shouldScrollToBottom = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Handle message submission
   */
  async onSendMessage(messageContent: string): Promise<void> {
    const conversation = this.activeConversation();
    if (!conversation) return;

    // Add user message
    const userMessage = this.messageService.addMessage(
      conversation.id,
      messageContent,
      'user'
    );

    // Update conversation preview with first message
    if (this.messages().length === 1) {
      this.conversationService.updateConversationPreview(
        conversation.id,
        messageContent.substring(0, 50)
      );
    }

    // Create placeholder for assistant response
    const assistantMessage = this.messageService.addMessage(
      conversation.id,
      '',
      'assistant'
    );
    this.messageService.setMessageLoading(assistantMessage.id, true);
    this.currentAssistantMessageId = assistantMessage.id;

    // Set generating state
    this.isGenerating.set(true);
    this.chatInput.setDisabled(true);

    try {
      // Call API and store subscription for potential cancellation
      this.currentSubscription = this.chatApiService.sendMessage(conversation.id, messageContent).subscribe({
        next: (response) => {
          // Update assistant message with response
          this.messageService.updateMessage(assistantMessage.id, response.content);
          this.messageService.setMessageLoading(assistantMessage.id, false);
          this.isGenerating.set(false);
          this.chatInput.setDisabled(false);
          this.currentSubscription = undefined;
          this.currentAssistantMessageId = undefined;
        },
        error: (error) => {
          console.error('Error sending message:', error);

          // Check if error is from cancellation
          if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            this.messageService.updateMessage(
              assistantMessage.id,
              '[Génération arrêtée par l\'utilisateur]'
            );
          } else {
            this.messageService.updateMessage(
              assistantMessage.id,
              'Désolé, une erreur s\'est produite. Veuillez réessayer.'
            );
          }

          this.messageService.setMessageLoading(assistantMessage.id, false);
          this.isGenerating.set(false);
          this.chatInput.setDisabled(false);
          this.currentSubscription = undefined;
          this.currentAssistantMessageId = undefined;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.messageService.setMessageLoading(assistantMessage.id, false);
      this.isGenerating.set(false);
      this.chatInput.setDisabled(false);
      this.currentSubscription = undefined;
      this.currentAssistantMessageId = undefined;
    }
  }

  /**
   * Handle copy message event
   */
  onCopyMessage(content: string): void {
    console.log('Message copié:', content.substring(0, 50) + '...');
    // Vous pouvez ajouter une notification ici
  }

  /**
   * Handle edit message event
   */
  onEditMessage(event: { message: Message, newContent: string }): void {
    const { message, newContent } = event;

    if (message.role !== 'user') return;

    // Delete the message and the assistant response that follows
    const conversation = this.activeConversation();
    if (!conversation) return;

    const messages = this.messageService.getConversationMessages(conversation.id);
    const messageIndex = messages.findIndex(m => m.id === message.id);

    if (messageIndex !== -1) {
      // Delete the user message and the next assistant message
      this.messageService.deleteMessage(message.id);

      if (messageIndex + 1 < messages.length && messages[messageIndex + 1].role === 'assistant') {
        this.messageService.deleteMessage(messages[messageIndex + 1].id);
      }
    }

    // Send the new message
    this.onSendMessage(newContent);
  }

  /**
   * Stop current generation
   */
  onStopGeneration(): void {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();

      if (this.currentAssistantMessageId) {
        this.messageService.updateMessage(
          this.currentAssistantMessageId,
          '[Génération arrêtée par l\'utilisateur]'
        );
        this.messageService.setMessageLoading(this.currentAssistantMessageId, false);
      }

      this.isGenerating.set(false);
      this.chatInput.setDisabled(false);
      this.currentSubscription = undefined;
      this.currentAssistantMessageId = undefined;
    }
  }

  /**
   * Scroll to bottom of messages container
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
