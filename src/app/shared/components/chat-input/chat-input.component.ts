import { Component, EventEmitter, Output, Input, signal, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;

  @Input() isGenerating: boolean = false;
  @Output() messageSent = new EventEmitter<string>();
  @Output() stopGeneration = new EventEmitter<void>();

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

  /**
   * Set value programmatically (for edit feature)
   */
  setValue(value: string): void {
    this.messageInput.set(value);
  }

  /**
   * Focus the textarea
   */
  focus(): void {
    if (this.messageTextarea) {
      this.messageTextarea.nativeElement.focus();
    }
  }

  /**
   * Stop generation
   */
  onStop(): void {
    this.stopGeneration.emit();
  }
}
