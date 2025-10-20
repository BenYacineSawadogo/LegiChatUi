import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { IChatApi } from '../interfaces/chat-api.interface';
import { Message, createMessage } from '../models/message.model';

/**
 * Chat API Service implementing IChatApi interface
 * Following Dependency Inversion Principle (DIP)
 * This is a mock implementation - replace with actual API calls
 */
@Injectable({
  providedIn: 'root'
})
export class ChatApiService implements IChatApi {
  private apiUrl = ''; // Will be configured later

  constructor(private http: HttpClient) {}

  /**
   * Configure API endpoint
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Send message to API and get response
   * Currently returns a mock response - replace with actual HTTP call
   */
  sendMessage(conversationId: string, message: string): Observable<Message> {
    // TODO: Replace with actual API call when endpoint is provided
    // Example:
    // return this.http.post<Message>(`${this.apiUrl}/chat`, {
    //   conversationId,
    //   message
    // });

    // Mock response for now
    const mockResponse = createMessage(
      conversationId,
      `Voici une réponse simulée à votre message: "${message}". Cette réponse sera remplacée par l'API réelle de Legichat.`,
      'assistant'
    );

    return of(mockResponse).pipe(delay(1000)); // Simulate network delay
  }
}
