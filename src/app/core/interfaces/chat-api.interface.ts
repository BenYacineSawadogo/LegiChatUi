import { Observable } from 'rxjs';
import { Message } from '../models/message.model';

/**
 * Interface for Chat API service
 * Following Interface Segregation Principle (ISP)
 */
export interface IChatApi {
  sendMessage(conversationId: string, message: string): Observable<Message>;
}
