# 📋 Spécifications Backend pour Legichat

Ce document décrit les spécifications complètes du backend nécessaire pour l'application frontend Legichat développée en Angular 20.

## 📱 Contexte du Frontend

### Technologies Utilisées
- **Framework** : Angular 20.3.6
- **Architecture** : Standalone Components avec Signals
- **State Management** : Angular Signals
- **Styling** : SCSS avec design moderne (bulles, ombres, gradients)
- **Responsive** : Mobile-first (breakpoint : 1080px)

### Architecture Frontend
```
src/app/
├── core/
│   ├── models/
│   │   ├── conversation.model.ts    # Modèle Conversation
│   │   └── message.model.ts         # Modèle Message
│   ├── interfaces/
│   │   ├── chat-api.interface.ts    # Interface IChatApi
│   │   └── storage.interface.ts     # Interface IStorage
│   └── services/
│       ├── chat-api.service.ts      # Service API (à connecter au backend)
│       ├── conversation.service.ts  # Gestion des conversations
│       ├── message.service.ts       # Gestion des messages
│       └── storage.service.ts       # Persistance locale
├── features/
│   ├── chat/                        # Composant principal de chat
│   └── conversation-list/           # Liste des conversations (sidebar)
└── shared/
    └── components/
        ├── message/                 # Composant message (bulles)
        └── chat-input/              # Zone de saisie
```

## 🗄️ Modèles de Données Frontend

### 1. Conversation Model

```typescript
// src/app/core/models/conversation.model.ts

export interface Conversation {
  id: string;                    // UUID unique
  title: string;                 // Titre de la conversation
  preview: string;               // Aperçu du premier message
  createdAt: Date;               // Date de création
  updatedAt: Date;               // Date de dernière modification
}

// Factory function utilisée
export function createConversation(
  title: string = 'Nouvelle conversation',
  preview: string = ''
): Conversation {
  return {
    id: crypto.randomUUID(),
    title,
    preview,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
```

### 2. Message Model

```typescript
// src/app/core/models/message.model.ts

export interface Message {
  id: string;                    // UUID unique
  conversationId: string;        // Référence à la conversation
  content: string;               // Contenu du message
  role: 'user' | 'assistant';    // Rôle (utilisateur ou chatbot)
  timestamp: Date;               // Horodatage
  isLoading?: boolean;           // Indicateur de chargement (frontend only)
}

// Factory function utilisée
export function createMessage(
  conversationId: string,
  content: string,
  role: 'user' | 'assistant'
): Message {
  return {
    id: crypto.randomUUID(),
    conversationId,
    content,
    role,
    timestamp: new Date(),
    isLoading: false
  };
}
```

## 🔌 API Endpoints Attendus

### Base URL
```
https://votre-api-legichat.com/api
```

### 1. **POST /chat** - Envoyer un message et recevoir une réponse

**Endpoint** : `POST /api/chat`

**Headers** :
```http
Content-Type: application/json
Authorization: Bearer <token>  # Si authentification nécessaire
```

**Request Body** :
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Quelle est la procédure pour créer une entreprise?"
}
```

**Response Body (Success - 200 OK)** :
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Pour créer une entreprise au Sénégal, vous devez suivre plusieurs étapes...",
  "role": "assistant",
  "timestamp": "2025-10-21T10:00:00.000Z"
}
```

**Response Body (Error - 400/500)** :
```json
{
  "error": {
    "code": "CHAT_ERROR",
    "message": "Description de l'erreur",
    "details": {}
  }
}
```

### 2. **GET /conversations** - Récupérer toutes les conversations (optionnel)

**Endpoint** : `GET /api/conversations`

**Headers** :
```http
Authorization: Bearer <token>
```

**Query Parameters** :
```
?page=1&limit=20&sort=updatedAt:desc
```

**Response Body (Success - 200 OK)** :
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Création d'entreprise",
      "preview": "Quelle est la procédure pour créer une entreprise?",
      "createdAt": "2025-10-20T10:00:00.000Z",
      "updatedAt": "2025-10-21T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### 3. **GET /conversations/:id/messages** - Récupérer l'historique d'une conversation (optionnel)

**Endpoint** : `GET /api/conversations/:id/messages`

**Headers** :
```http
Authorization: Bearer <token>
```

**Query Parameters** :
```
?page=1&limit=50&sort=timestamp:asc
```

**Response Body (Success - 200 OK)** :
```json
{
  "messages": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Quelle est la procédure pour créer une entreprise?",
      "role": "user",
      "timestamp": "2025-10-21T09:55:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Pour créer une entreprise au Sénégal...",
      "role": "assistant",
      "timestamp": "2025-10-21T09:55:05.000Z"
    }
  ],
  "pagination": {
    "total": 24,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

### 4. **POST /conversations** - Créer une nouvelle conversation (optionnel)

**Endpoint** : `POST /api/conversations`

**Headers** :
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body** :
```json
{
  "title": "Nouvelle conversation"
}
```

**Response Body (Success - 201 Created)** :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "title": "Nouvelle conversation",
  "preview": "",
  "createdAt": "2025-10-21T10:00:00.000Z",
  "updatedAt": "2025-10-21T10:00:00.000Z"
}
```

### 5. **DELETE /conversations/:id** - Supprimer une conversation (optionnel)

**Endpoint** : `DELETE /api/conversations/:id`

**Headers** :
```http
Authorization: Bearer <token>
```

**Response Body (Success - 204 No Content)** :
```
(Pas de body)
```

**Response Body (Error - 404 Not Found)** :
```json
{
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "La conversation n'existe pas"
  }
}
```

## 🔄 Flux de Données Frontend → Backend

### Scénario : Envoi d'un message

1. **Utilisateur saisit un message** dans le composant `chat-input`
2. **Événement émis** : `onSendMessage(message: string)`
3. **Composant chat** reçoit le message et :
   - Crée un message utilisateur avec `createMessage(conversationId, content, 'user')`
   - L'ajoute au state via `messageService.addMessage()`
   - Affiche le message immédiatement (optimistic UI)
4. **Création d'un placeholder** pour la réponse de l'assistant :
   - `messageService.addMessage(conversationId, '', 'assistant')`
   - `messageService.setMessageLoading(assistantMessageId, true)`
   - Affiche l'indicateur de typing avec 3 points animés
5. **Appel API** via `chatApiService.sendMessage(conversationId, message)` :
   ```typescript
   // src/app/core/services/chat-api.service.ts
   sendMessage(conversationId: string, message: string): Observable<Message> {
     return this.http.post<any>(`${this.apiUrl}/chat`, {
       conversationId,
       message
     }).pipe(
       map(response => createMessage(
         response.conversationId,
         response.content,
         'assistant'
       ))
     );
   }
   ```
6. **Réception de la réponse** :
   - Met à jour le message placeholder avec le contenu reçu
   - `messageService.updateMessage(assistantMessageId, response.content)`
   - `messageService.setMessageLoading(assistantMessageId, false)`
   - Désactive l'indicateur de typing
7. **Scroll automatique** vers le bas de la liste des messages

## 🏗️ Architecture Backend Recommandée

### Structure Suggérée (Principe SOLID)

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── chat.controller.ts           # Routes /api/chat
│   │   │   └── conversation.controller.ts   # Routes /api/conversations
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts           # Authentification JWT
│   │   │   ├── validation.middleware.ts     # Validation des requêtes
│   │   │   └── error.middleware.ts          # Gestion des erreurs
│   │   └── routes/
│   │       └── index.ts                     # Définition des routes
│   ├── core/
│   │   ├── models/
│   │   │   ├── conversation.model.ts        # Schéma Conversation
│   │   │   ├── message.model.ts             # Schéma Message
│   │   │   └── user.model.ts                # Schéma User (si auth)
│   │   ├── services/
│   │   │   ├── chat.service.ts              # Logique métier chat
│   │   │   ├── conversation.service.ts      # CRUD conversations
│   │   │   ├── message.service.ts           # CRUD messages
│   │   │   └── ai.service.ts                # Intégration IA/LLM
│   │   ├── repositories/
│   │   │   ├── conversation.repository.ts   # Accès DB conversations
│   │   │   └── message.repository.ts        # Accès DB messages
│   │   └── interfaces/
│   │       ├── chat-api.interface.ts
│   │       └── repository.interface.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── mongodb.connection.ts        # Connexion MongoDB
│   │   │   └── migrations/                  # Scripts de migration
│   │   ├── cache/
│   │   │   └── redis.service.ts             # Cache Redis (optionnel)
│   │   └── ai/
│   │       ├── openai.adapter.ts            # Adapter OpenAI
│   │       ├── claude.adapter.ts            # Adapter Claude
│   │       └── ollama.adapter.ts            # Adapter Ollama (local)
│   ├── config/
│   │   ├── app.config.ts                    # Configuration app
│   │   ├── database.config.ts               # Config DB
│   │   └── ai.config.ts                     # Config IA/LLM
│   └── utils/
│       ├── logger.ts                        # Logger
│       ├── validator.ts                     # Validateurs
│       └── errors.ts                        # Classes d'erreur custom
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example                             # Variables d'environnement
├── package.json
└── tsconfig.json
```

## 🔐 Sécurité & Authentification

### Recommandations

1. **Authentification JWT** :
   ```typescript
   // Header Authorization
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Validation des entrées** :
   - Utiliser Joi, Zod ou class-validator
   - Vérifier la longueur maximale des messages (ex: 4000 caractères)
   - Sanitizer le HTML/scripts malveillants

3. **Rate Limiting** :
   - Limiter les requêtes par utilisateur (ex: 30 req/min)
   - Limiter la taille des messages

4. **CORS** :
   ```typescript
   // Autoriser le frontend
   cors({
     origin: ['http://localhost:4200', 'https://legichat.votre-domaine.com'],
     credentials: true
   })
   ```

## 🤖 Intégration IA/LLM

### Options Recommandées

#### Option 1 : OpenAI GPT-4
```typescript
// ai.service.ts
async generateResponse(prompt: string, conversationHistory: Message[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Tu es Legichat, un assistant spécialisé en droit sénégalais..."
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return response.choices[0].message.content;
}
```

#### Option 2 : Anthropic Claude
```typescript
async generateResponse(prompt: string, conversationHistory: Message[]): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: "Tu es Legichat, un assistant spécialisé en droit sénégalais...",
    messages: conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })).concat([{
      role: "user",
      content: prompt
    }])
  });

  return response.content[0].text;
}
```

#### Option 3 : Ollama (Local)
```typescript
async generateResponse(prompt: string, conversationHistory: Message[]): Promise<string> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      model: "llama3.2",
      messages: conversationHistory.concat([{
        role: "user",
        content: prompt
      }]),
      stream: false
    })
  });

  const data = await response.json();
  return data.message.content;
}
```

## 💾 Base de Données

### Schémas MongoDB Recommandés

#### Collection : conversations
```javascript
{
  _id: ObjectId("..."),
  id: "550e8400-e29b-41d4-a716-446655440000",  // UUID
  userId: "user123",                            // Référence utilisateur
  title: "Création d'entreprise",
  preview: "Quelle est la procédure...",
  createdAt: ISODate("2025-10-20T10:00:00.000Z"),
  updatedAt: ISODate("2025-10-21T10:00:00.000Z"),
  metadata: {
    messageCount: 12,
    lastMessageAt: ISODate("2025-10-21T10:00:00.000Z")
  }
}
```

**Index** :
```javascript
db.conversations.createIndex({ userId: 1, updatedAt: -1 })
db.conversations.createIndex({ id: 1 }, { unique: true })
```

#### Collection : messages
```javascript
{
  _id: ObjectId("..."),
  id: "660e8400-e29b-41d4-a716-446655440001",  // UUID
  conversationId: "550e8400-e29b-41d4-a716-446655440000",
  content: "Quelle est la procédure pour créer une entreprise?",
  role: "user",  // "user" | "assistant"
  timestamp: ISODate("2025-10-21T09:55:00.000Z"),
  metadata: {
    tokens: 125,
    model: "gpt-4",
    processingTime: 1234  // ms
  }
}
```

**Index** :
```javascript
db.messages.createIndex({ conversationId: 1, timestamp: 1 })
db.messages.createIndex({ id: 1 }, { unique: true })
```

## ⚡ Performance & Optimisations

### 1. Caching (Redis)
```typescript
// Cache des conversations récentes
await redis.setex(
  `conversation:${conversationId}`,
  3600,  // 1 heure
  JSON.stringify(conversation)
);
```

### 2. Streaming de Réponses (Optionnel)
```typescript
// Server-Sent Events pour streaming en temps réel
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [...],
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    res.write(`data: ${JSON.stringify({ content })}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();
});
```

### 3. Pagination
```typescript
// Implémenter la pagination sur tous les endpoints de liste
interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  sort?: string;      // Format: "field:asc|desc"
}
```

## 🧪 Tests Recommandés

### Tests Unitaires
```typescript
describe('ChatService', () => {
  it('should create a new message', async () => {
    const message = await chatService.sendMessage(
      'conversationId',
      'Test message'
    );
    expect(message.content).toBeDefined();
    expect(message.role).toBe('assistant');
  });
});
```

### Tests d'Intégration
```typescript
describe('POST /api/chat', () => {
  it('should return assistant response', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        conversationId: 'test-id',
        message: 'Test question'
      })
      .expect(200);

    expect(response.body.content).toBeDefined();
    expect(response.body.role).toBe('assistant');
  });
});
```

## 📊 Logging & Monitoring

### Logs Recommandés
```typescript
// Structure de log
{
  timestamp: "2025-10-21T10:00:00.000Z",
  level: "info",
  service: "chat-api",
  method: "POST",
  path: "/api/chat",
  userId: "user123",
  conversationId: "550e8400-e29b-41d4-a716-446655440000",
  duration: 1234,  // ms
  statusCode: 200,
  message: "Message sent successfully"
}
```

### Métriques à Suivre
- Temps de réponse moyen par requête
- Nombre de messages par jour/heure
- Taux d'erreur API
- Utilisation des tokens IA
- Coût par conversation

## 🔧 Variables d'Environnement

```bash
# .env.example

# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.legichat.com

# Database
MONGODB_URI=mongodb://localhost:27017/legichat
MONGODB_DB_NAME=legichat

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRATION=7d

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000

# Anthropic Claude (alternative)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Ollama (local, alternative)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# CORS
CORS_ORIGIN=http://localhost:4200,https://legichat.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## 🚀 Déploiement

### Checklist Pré-déploiement

- [ ] Configurer les variables d'environnement
- [ ] Créer les index de base de données
- [ ] Configurer le CORS avec le domaine frontend
- [ ] Activer le rate limiting
- [ ] Configurer le logging
- [ ] Ajouter le monitoring (ex: Sentry, DataDog)
- [ ] Configurer le reverse proxy (Nginx)
- [ ] Activer HTTPS/SSL
- [ ] Tester tous les endpoints
- [ ] Documenter l'API (Swagger/OpenAPI)

### Stack Technique Recommandée

**Option 1 : Node.js/Express**
```
- Express.js
- TypeScript
- MongoDB + Mongoose
- Redis (cache)
- JWT authentication
- Winston (logging)
```

**Option 2 : NestJS (Recommandé pour architecture SOLID)**
```
- NestJS
- TypeScript
- MongoDB + Mongoose/TypeORM
- Redis
- Passport JWT
- Built-in logging
```

**Option 3 : Python/FastAPI**
```
- FastAPI
- Python 3.11+
- MongoDB + Motor
- Redis
- JWT authentication
- Pydantic validation
```

## 📖 Documentation API

### Générer la Documentation Swagger

```typescript
// swagger.config.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Legichat API',
      version: '1.0.0',
      description: 'API pour le chatbot Legichat spécialisé en droit sénégalais'
    },
    servers: [
      {
        url: 'https://api.legichat.com',
        description: 'Production'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development'
      }
    ]
  },
  apis: ['./src/api/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
```

## 🎯 Prochaines Étapes

### Phase 1 : MVP (Minimum Viable Product)
1. Implémenter l'endpoint `POST /api/chat` avec réponses simulées
2. Configurer la base de données MongoDB
3. Créer les modèles Conversation et Message
4. Tester l'intégration avec le frontend

### Phase 2 : Intégration IA
1. Choisir le provider IA (OpenAI, Claude, Ollama)
2. Implémenter le service IA
3. Gérer l'historique des conversations
4. Optimiser les prompts système

### Phase 3 : Fonctionnalités Avancées
1. Authentification utilisateur
2. Persistance des conversations par utilisateur
3. Endpoints CRUD complets pour conversations
4. Streaming de réponses en temps réel

### Phase 4 : Production
1. Caching avec Redis
2. Rate limiting et sécurité
3. Monitoring et logging
4. Documentation API complète
5. Tests automatisés (unit, integration, e2e)

---

## 📞 Contact Frontend

Pour toute question sur l'intégration frontend, se référer à :
- `INTEGRATION_API.md` : Guide d'intégration API frontend
- `README.md` : Documentation générale du projet
- Code source : `src/app/core/services/chat-api.service.ts`

**Fichier créé le** : 2025-10-21
**Version Frontend** : Angular 20.3.6
**Version Spécification** : 1.0.0
