import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../core/models/message.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

/**
 * Message Component
 * Displays a single chat message with Markdown support
 */
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  @Input({ required: true }) message!: Message;
  @Output() copyMessage = new EventEmitter<string>();
  @Output() editMessage = new EventEmitter<{ message: Message, newContent: string }>();

  isEditing = signal(false);
  editedContent = signal('');

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
   * Start editing mode for user messages only
   */
  onEdit(): void {
    if (this.message.role === 'user' && !this.isEditing()) {
      this.editedContent.set(this.message.content);
      this.isEditing.set(true);
    }
  }

  /**
   * Save edited message
   */
  onSaveEdit(): void {
    const newContent = this.editedContent().trim();
    if (newContent && newContent !== this.message.content) {
      this.editMessage.emit({
        message: this.message,
        newContent: newContent
      });
    }
    this.isEditing.set(false);
  }

  /**
   * Cancel editing mode
   */
  onCancelEdit(): void {
    this.isEditing.set(false);
    this.editedContent.set('');
  }

  /**
   * Handle Enter key in edit textarea
   */
  onEditKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSaveEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancelEdit();
    }
  }
}
