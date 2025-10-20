import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Chat Input Component
 * Handles message input and submission
 */
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent {
  @Output() messageSent = new EventEmitter<string>();

  messageInput = signal('');
  isDisabled = signal(false);

  /**
   * Handle message submission
   */
  onSubmit(): void {
    const message = this.messageInput().trim();
    if (message && !this.isDisabled()) {
      this.messageSent.emit(message);
      this.messageInput.set('');
    }
  }

  /**
   * Handle Enter key press
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }
}
