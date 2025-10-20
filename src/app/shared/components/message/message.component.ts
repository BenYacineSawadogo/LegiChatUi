import { Component, Input } from '@angular/core';
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
}
