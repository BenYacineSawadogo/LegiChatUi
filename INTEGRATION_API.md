# 🔌 Guide d'Intégration de l'API Legichat

Ce document explique comment intégrer votre API backend avec l'interface Legichat.

## 📋 Table des matières

1. [Configuration de base](#configuration-de-base)
2. [Formats de données](#formats-de-données)
3. [Implémentation](#implémentation)
4. [Gestion des erreurs](#gestion-des-erreurs)
5. [Streaming (optionnel)](#streaming-optionnel)
6. [Exemples complets](#exemples-complets)

## Configuration de base

### Étape 1 : Configurer l'URL de l'API

**Fichier** : `src/app/core/services/chat-api.service.ts`

```typescript
export class ChatApiService implements IChatApi {
  // Remplacez par l'URL de votre API
  private apiUrl = 'https://votre-api-legichat.com/api';

  constructor(private http: HttpClient) {}
}
```

### Étape 2 : Configuration dynamique (recommandé)

**Fichier** : `src/app/app.config.ts`

```typescript
import { APP_INITIALIZER } from '@angular/core';
import { ChatApiService } from './core/services/chat-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... autres providers
    {
      provide: APP_INITIALIZER,
      useFactory: (apiService: ChatApiService) => () => {
        // Configuration depuis un fichier de config ou environnement
        apiService.setApiUrl(environment.apiUrl);
      },
      deps: [ChatApiService],
      multi: true
    }
  ]
};
```

## Formats de données

### Format de requête

#### Endpoint : `POST /chat`

```typescript
interface ChatRequest {
  conversationId: string;  // ID unique de la conversation
  message: string;         // Message de l'utilisateur
}
```

**Exemple de requête** :
```json
{
  "conversationId": "conv-1729459200-abc123",
  "message": "Bonjour, comment ça va ?"
}
```

### Format de réponse

```typescript
interface ChatResponse {
  id: string;              // ID unique du message
  conversationId: string;  // ID de la conversation
  content: string;         // Contenu de la réponse
  role: "assistant";       // Toujours "assistant" pour les réponses
  timestamp: string;       // ISO 8601 format
}
```

**Exemple de réponse** :
```json
{
  "id": "msg-1729459201-xyz789",
  "conversationId": "conv-1729459200-abc123",
  "content": "Bonjour ! Je vais bien, merci. Comment puis-je vous aider ?",
  "role": "assistant",
  "timestamp": "2025-10-20T21:00:01Z"
}
```

## Implémentation

### Implémentation simple

**Fichier** : `src/app/core/services/chat-api.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IChatApi } from '../interfaces/chat-api.interface';
import { Message, createMessage } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService implements IChatApi {
  private apiUrl = 'https://votre-api.com/api';

  constructor(private http: HttpClient) {}

  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

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

interface ChatResponse {
  id: string;
  conversationId: string;
  content: string;
  role: string;
  timestamp: string;
}
```

### Implémentation avec headers personnalisés

```typescript
sendMessage(conversationId: string, message: string): Observable<Message> {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getAuthToken()}`,
    'X-Client-Version': '1.0.0'
  };

  return this.http.post<ChatResponse>(
    `${this.apiUrl}/chat`,
    { conversationId, message },
    { headers }
  ).pipe(
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

private getAuthToken(): string {
  // Récupérer le token depuis le storage ou un service d'auth
  return localStorage.getItem('auth_token') || '';
}
```

## Gestion des erreurs

### Implémentation avec gestion d'erreurs

```typescript
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

sendMessage(conversationId: string, message: string): Observable<Message> {
  return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, {
    conversationId,
    message
  }).pipe(
    retry(2), // Réessayer 2 fois en cas d'erreur réseau
    map(response => ({
      id: response.id,
      conversationId: response.conversationId,
      content: response.content,
      role: 'assistant' as const,
      timestamp: new Date(response.timestamp),
      isLoading: false
    })),
    catchError(error => {
      console.error('Erreur API:', error);

      // Créer un message d'erreur pour l'utilisateur
      const errorMessage = this.createErrorMessage(
        conversationId,
        error
      );

      return throwError(() => errorMessage);
    })
  );
}

private createErrorMessage(conversationId: string, error: any): Message {
  let content = 'Une erreur est survenue. ';

  if (error.status === 401) {
    content += 'Veuillez vous reconnecter.';
  } else if (error.status === 429) {
    content += 'Trop de requêtes. Veuillez réessayer dans quelques instants.';
  } else if (error.status >= 500) {
    content += 'Le serveur rencontre des difficultés. Veuillez réessayer plus tard.';
  } else {
    content += 'Veuillez réessayer.';
  }

  return createMessage(conversationId, content, 'assistant');
}
```

## Streaming (optionnel)

Si votre API supporte le streaming (comme ChatGPT), vous pouvez implémenter :

### Avec Server-Sent Events (SSE)

```typescript
import { Observable } from 'rxjs';

sendMessageStream(
  conversationId: string,
  message: string
): Observable<string> {
  return new Observable(observer => {
    const eventSource = new EventSource(
      `${this.apiUrl}/chat/stream?conversationId=${conversationId}&message=${encodeURIComponent(message)}`
    );

    eventSource.onmessage = (event) => {
      observer.next(event.data);
    };

    eventSource.onerror = (error) => {
      eventSource.close();
      observer.error(error);
    };

    eventSource.addEventListener('done', () => {
      eventSource.close();
      observer.complete();
    });

    return () => eventSource.close();
  });
}
```

### Modification du ChatComponent pour le streaming

```typescript
// Dans chat.component.ts
onSendMessage(messageContent: string): void {
  const conversation = this.activeConversation();
  if (!conversation) return;

  // Message utilisateur
  this.messageService.addMessage(conversation.id, messageContent, 'user');

  // Message assistant vide pour le streaming
  const assistantMessage = this.messageService.addMessage(
    conversation.id,
    '',
    'assistant'
  );

  this.messageService.setMessageLoading(assistantMessage.id, true);

  let accumulatedContent = '';

  this.chatApiService.sendMessageStream(conversation.id, messageContent)
    .subscribe({
      next: (chunk) => {
        // Accumuler le contenu
        accumulatedContent += chunk;
        // Mettre à jour le message en temps réel
        this.messageService.updateMessage(
          assistantMessage.id,
          accumulatedContent
        );
      },
      complete: () => {
        this.messageService.setMessageLoading(assistantMessage.id, false);
      },
      error: (error) => {
        console.error('Streaming error:', error);
        this.messageService.setMessageLoading(assistantMessage.id, false);
      }
    });
}
```

## Exemples complets

### Exemple 1 : API REST simple

```typescript
@Injectable({
  providedIn: 'root'
})
export class ChatApiService implements IChatApi {
  private apiUrl = 'https://api.legichat.com/v1';

  constructor(private http: HttpClient) {}

  sendMessage(conversationId: string, message: string): Observable<Message> {
    return this.http.post<any>(`${this.apiUrl}/chat`, {
      conversation_id: conversationId,
      user_message: message
    }).pipe(
      map(response => createMessage(
        response.conversation_id,
        response.assistant_message,
        'assistant'
      )),
      catchError(error => {
        const errorMsg = createMessage(
          conversationId,
          'Désolé, une erreur est survenue.',
          'assistant'
        );
        return throwError(() => errorMsg);
      })
    );
  }
}
```

### Exemple 2 : API avec authentification

```typescript
@Injectable({
  providedIn: 'root'
})
export class ChatApiService implements IChatApi {
  private apiUrl = 'https://api.legichat.com/v1';
  private authToken = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authToken = this.authService.getToken();
  }

  sendMessage(conversationId: string, message: string): Observable<Message> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(
      `${this.apiUrl}/chat`,
      { conversationId, message },
      { headers }
    ).pipe(
      map(response => createMessage(
        response.conversationId,
        response.content,
        'assistant'
      ))
    );
  }
}
```

## Configuration CORS

### Backend (exemple Node.js/Express)

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4200', // URL de votre app Angular
  methods: ['GET', 'POST'],
  credentials: true
}));
```

### Backend (exemple Python/Flask)

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"])
```

## Tests de l'intégration

### Test manuel avec curl

```bash
curl -X POST https://votre-api.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "message": "Bonjour"
  }'
```

### Test dans l'application

1. Lancez l'application : `npm start`
2. Ouvrez la console du navigateur (F12)
3. Créez une conversation et envoyez un message
4. Vérifiez les requêtes dans l'onglet Network

## Checklist d'intégration

- [ ] URL de l'API configurée
- [ ] Format de requête correspond
- [ ] Format de réponse correspond
- [ ] Gestion des erreurs implémentée
- [ ] CORS configuré sur le backend
- [ ] Tests effectués avec succès
- [ ] Headers d'authentification (si nécessaire)
- [ ] Timeouts configurés
- [ ] Retry logic implémentée

## Dépannage

### Erreur CORS

**Symptôme** : Erreur "Access-Control-Allow-Origin" dans la console

**Solution** : Configurez CORS sur votre backend pour autoriser `http://localhost:4200`

### Timeout

**Symptôme** : Requête qui prend trop de temps

**Solution** :
```typescript
return this.http.post<any>(`${this.apiUrl}/chat`, data, {
  headers,
  params: {
    timeout: '30000' // 30 secondes
  }
});
```

### Erreur 401 Non autorisé

**Symptôme** : Erreur 401

**Solution** : Vérifiez que le token d'authentification est correctement envoyé

```typescript
const token = localStorage.getItem('auth_token');
const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}`
});
```

## Support

Pour toute question sur l'intégration, consultez :
- Le code source dans `src/app/core/services/chat-api.service.ts`
- Les interfaces dans `src/app/core/interfaces/`
- Les modèles dans `src/app/core/models/`

---

**Bonne intégration ! 🚀**
