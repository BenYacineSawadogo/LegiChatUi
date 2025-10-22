import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../core/models/message.model';

/**
 * Message Component
 * Displays a single chat message
 */
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  @Input({ required: true }) message!: Message;
  @Output() copyMessage = new EventEmitter<string>();
  @Output() editMessage = new EventEmitter<Message>();

  /**
   * Format timestamp for display
   */
  formatTime(date: Date): string {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Copy message content to clipboard
   */
  async onCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.message.content);
      this.copyMessage.emit(this.message.content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  }

  /**
   * Emit edit event for user messages only
   */
  onEdit(): void {
    if (this.message.role === 'user') {
      this.editMessage.emit(this.message);
    }
  }
}
