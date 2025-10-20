import { Component, computed, effect, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from '../../shared/components/message/message.component';
import { ChatInputComponent } from '../../shared/components/chat-input/chat-input.component';
import { ConversationService } from '../../core/services/conversation.service';
import { MessageService } from '../../core/services/message.service';
import { ChatApiService } from '../../core/services/chat-api.service';

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

  activeConversation = this.conversationService.activeConversation;

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

    // Disable input while waiting for response
    this.chatInput.setDisabled(true);

    try {
      // Call API
      this.chatApiService.sendMessage(conversation.id, messageContent).subscribe({
        next: (response) => {
          // Update assistant message with response
          this.messageService.updateMessage(assistantMessage.id, response.content);
          this.messageService.setMessageLoading(assistantMessage.id, false);
          this.chatInput.setDisabled(false);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.messageService.updateMessage(
            assistantMessage.id,
            'Désolé, une erreur s\'est produite. Veuillez réessayer.'
          );
          this.messageService.setMessageLoading(assistantMessage.id, false);
          this.chatInput.setDisabled(false);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.messageService.setMessageLoading(assistantMessage.id, false);
      this.chatInput.setDisabled(false);
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
