import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IChatApi } from '../interfaces/chat-api.interface';
import { Message } from '../models/message.model';

/**
 * Chat API Service implementing IChatApi interface
 * Following Dependency Inversion Principle (DIP)
 * Connected to Flask backend with Mistral AI + FAISS RAG
 */
@Injectable({
  providedIn: 'root'
})
export class ChatApiService implements IChatApi {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  /**
   * Configure API endpoint (optional, for production)
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Send message to backend and get AI response
   * Backend handles conversation context automatically
   */
  sendMessage(conversationId: string, message: string): Observable<Message> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, {
      conversationId,
      message
    }).pipe(
      map(response => ({
        id: response.id,
        conversationId: response.conversationId,
        content: response.content,
        role: 'assistant' as const,
        timestamp: new Date(response.timestamp),
        isLoading: false
      }))
    );
  }
}

/**
 * Response format from Flask backend
 */
interface ChatResponse {
  id: string;
  conversationId: string;
  content: string;
  role: string;
  timestamp: string;
}
