/**
 * Response metadata from backend (v2.1)
 */
export interface ResponseSource {
  document?: string;
  relevance?: number;
  type?: string;
  numero?: string;
  lien?: string;
}

export interface ResponseMetadata {
  responseType: 'legal_answer' | 'document_link' | 'document_summary' | 'not_found' | 'error';
  country: string;
  sources: ResponseSource[];
}

/**
 * Message model representing a chat message
 */
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  metadata?: ResponseMetadata;  // Only present for assistant messages
}

/**
 * Factory function to create a new message
 */
export function createMessage(
  conversationId: string,
  content: string,
  role: 'user' | 'assistant'
): Message {
  return {
    id: generateId(),
    conversationId,
    content,
    role,
    timestamp: new Date(),
    isLoading: false
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
