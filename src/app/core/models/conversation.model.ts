/**
 * Conversation model representing a chat conversation
 */
export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  preview?: string;
}

/**
 * Factory function to create a new conversation
 */
export function createConversation(title?: string): Conversation {
  const now = new Date();
  return {
    id: generateId(),
    title: title || 'Nouvelle conversation',
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
