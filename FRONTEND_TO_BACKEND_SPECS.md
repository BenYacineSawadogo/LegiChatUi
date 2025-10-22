# 📋 Spécifications Frontend → Backend - Legichat UI

**Document de référence pour adapter votre backend au frontend Angular 20**

## 🎯 Objectif

Ce document décrit en détail l'architecture et les attentes du frontend Legichat pour que vous puissiez adapter votre backend existant. Le frontend est **déjà fonctionnel** avec une API mock. Vous devez maintenant faire en sorte que votre backend réponde aux mêmes contrats.

---

## 📊 Vue d'ensemble du Frontend

### Technologies
- **Framework**: Angular 20.3.6 (standalone components)
- **Architecture**: SOLID principles, Signals, Reactive Programming (RxJS)
- **Stockage**: LocalStorage (conversations et messages)
- **API**: HTTP REST (pas de WebSocket pour l'instant)

### Fonctionnalités implémentées
✅ Gestion de conversations multiples
✅ Envoi et réception de messages
✅ Édition de messages utilisateur (inline dans la bulle)
✅ Copie de messages
✅ Arrêt de génération pendant l'appel API
✅ Indicateurs de chargement
✅ Interface responsive (mobile + desktop)
✅ Sauvegarde automatique en LocalStorage

---

## 🗂️ Modèles de Données (TypeScript)

### 1. Conversation

**Fichier**: `src/app/core/models/conversation.model.ts`

```typescript
interface Conversation {
  id: string;           // Format: "conv-1729459200-abc123"
  title: string;        // Ex: "Nouvelle conversation"
  createdAt: Date;      // Date de création
  updatedAt: Date;      // Date de dernière mise à jour
  preview?: string;     // Aperçu du premier message (optionnel)
}
```

**Génération d'ID frontend**:
```typescript
// Format: conv-{timestamp}-{random}
id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
// Exemple: "conv-1729459200-k8j3h2l9q"
```

**Important**:
- Le frontend génère les IDs de conversation localement
- Ces IDs sont envoyés au backend avec chaque message
- Le backend DOIT accepter et utiliser ces IDs (ne pas générer les siens)

### 2. Message

**Fichier**: `src/app/core/models/message.model.ts`

```typescript
interface Message {
  id: string;              // Format: "1729459201-xyz789"
  conversationId: string;  // ID de la conversation parente
  content: string;         // Contenu du message
  role: 'user' | 'assistant';  // Rôle de l'émetteur
  timestamp: Date;         // Date d'envoi
  isLoading?: boolean;     // État de chargement (géré frontend)
}
```

**Génération d'ID frontend**:
```typescript
// Format: {timestamp}-{random}
id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
// Exemple: "1729459201-m7k2j9q1x"
```

**Important**:
- Le frontend génère les IDs des messages **utilisateur** uniquement
- Le backend DOIT générer les IDs des messages **assistant**
- Le champ `isLoading` est géré uniquement par le frontend (ne pas l'envoyer)

---

## 🔌 Contrat API REST

### Endpoint Principal: POST /api/chat

**URL complète**: `{VOTRE_BACKEND_URL}/api/chat`

### Requête HTTP

**Headers**:
```http
POST /api/chat HTTP/1.1
Content-Type: application/json
Accept: application/json
```

**Body (JSON)**:
```typescript
{
  "conversationId": string,  // ID généré par le frontend
  "message": string          // Contenu du message utilisateur
}
```

**Exemple réel**:
```json
{
  "conversationId": "conv-1729459200-k8j3h2l9q",
  "message": "Quelle est la procédure pour créer une entreprise au Sénégal ?"
}
```

### Réponse HTTP

**Status Code**: `200 OK`

**Headers**:
```http
Content-Type: application/json
```

**Body (JSON)**:
```typescript
{
  "id": string,              // ID unique du message assistant (généré backend)
  "conversationId": string,  // MÊME ID que dans la requête
  "content": string,         // Réponse de l'assistant/IA
  "role": "assistant",       // DOIT toujours être "assistant"
  "timestamp": string        // Format ISO 8601
}
```

**Exemple réel**:
```json
{
  "id": "msg-1729459201-xyz789",
  "conversationId": "conv-1729459200-k8j3h2l9q",
  "content": "Pour créer une entreprise au Sénégal, vous devez suivre les étapes suivantes...",
  "role": "assistant",
  "timestamp": "2025-10-22T14:30:01.000Z"
}
```

### Format du Timestamp

**OBLIGATOIRE**: Format ISO 8601 (compatible JavaScript `new Date()`)

```javascript
// Côté Backend (exemples)
// Node.js:
timestamp: new Date().toISOString()  // "2025-10-22T14:30:01.000Z"

// Python:
from datetime import datetime
timestamp = datetime.utcnow().isoformat() + 'Z'

// Le frontend convertira avec:
timestamp: new Date(response.timestamp)
```

---

## 🔄 Flux de Communication Frontend → Backend

### 1. Utilisateur envoie un message

```
[Utilisateur tape "Bonjour"]
         ↓
[Frontend génère ID conversation si nouvelle]
         ↓
[Frontend crée message user et l'affiche]
         ↓
[Frontend crée message assistant vide avec isLoading=true]
         ↓
[Frontend envoie POST /api/chat]
```

**Requête envoyée**:
```json
POST /api/chat
{
  "conversationId": "conv-1729459200-k8j3h2l9q",
  "message": "Bonjour"
}
```

### 2. Backend traite et répond

```
[Backend reçoit requête]
         ↓
[Backend extrait conversationId et message]
         ↓
[Backend appelle IA/LLM avec le message]
         ↓
[Backend génère ID pour le message assistant]
         ↓
[Backend retourne réponse JSON]
```

**Réponse retournée**:
```json
200 OK
{
  "id": "msg-1729459201-xyz789",
  "conversationId": "conv-1729459200-k8j3h2l9q",
  "content": "Bonjour ! Comment puis-je vous aider avec le droit sénégalais ?",
  "role": "assistant",
  "timestamp": "2025-10-22T14:30:01.000Z"
}
```

### 3. Frontend affiche la réponse

```
[Frontend reçoit réponse 200]
         ↓
[Frontend extrait response.content]
         ↓
[Frontend met à jour le message assistant vide]
         ↓
[Frontend désactive isLoading]
         ↓
[Message assistant affiché à l'utilisateur]
```

---

## 🎨 Fonctionnalités Frontend Avancées

### 1. Édition de Message

**Comportement**:
1. Utilisateur clique sur ✏️ sur son propre message
2. Textarea inline apparaît dans la bulle
3. Utilisateur modifie et clique ✓ (ou Échap pour annuler)
4. Frontend **supprime** le message user ET la réponse assistant
5. Frontend **renvoie** un nouveau POST /api/chat avec le nouveau contenu

**Impact Backend**:
- Vous recevrez un nouveau message pour la même conversation
- Vous devez générer une nouvelle réponse
- PAS besoin de gérer la suppression (le frontend gère son LocalStorage)

### 2. Arrêt de Génération

**Comportement**:
1. Pendant l'appel HTTP POST /api/chat
2. Utilisateur clique sur le bouton STOP (■)
3. Frontend annule la requête HTTP (`subscription.unsubscribe()`)
4. Frontend affiche "[Génération arrêtée par l'utilisateur]"

**Impact Backend**:
- La connexion HTTP sera fermée côté client
- Votre backend DOIT gérer les connexions interrompues proprement
- Recommandation: implémenter un timeout côté serveur

### 3. Copie de Message

**Comportement**:
- Utilisateur clique sur 📋
- Frontend copie le contenu dans le presse-papier
- Aucun appel backend

---

## 🛠️ Implémentation Côté Frontend

### Service API (chat-api.service.ts)

**État actuel** (mock):
```typescript
@Injectable({ providedIn: 'root' })
export class ChatApiService implements IChatApi {
  private apiUrl = ''; // À CONFIGURER

  sendMessage(conversationId: string, message: string): Observable<Message> {
    // ACTUELLEMENT: Mock avec délai de 1 seconde
    // À REMPLACER PAR: Appel HTTP réel vers votre backend

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
```

**Ce que le frontend attend**:
1. Requête HTTP POST vers `${apiUrl}/chat`
2. Body JSON: `{ conversationId, message }`
3. Réponse JSON avec les champs: `id`, `conversationId`, `content`, `role`, `timestamp`
4. Conversion du timestamp string vers Date object

---

## 📝 Instructions pour Adapter Votre Backend

### Étape 1: Créer/Modifier l'Endpoint POST /api/chat

**Pseudo-code**:
```javascript
app.post('/api/chat', async (req, res) => {
  // 1. Extraire les données
  const { conversationId, message } = req.body;

  // 2. Validation
  if (!conversationId || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // 3. Sauvegarder le message utilisateur (optionnel)
  // await saveMessage({
  //   conversationId,
  //   content: message,
  //   role: 'user',
  //   timestamp: new Date()
  // });

  // 4. Appeler votre IA/LLM
  const aiResponse = await callYourAI(conversationId, message);

  // 5. Générer ID pour le message assistant
  const assistantMessageId = generateMessageId(); // Ex: "msg-" + Date.now()

  // 6. Sauvegarder la réponse (optionnel)
  // await saveMessage({
  //   id: assistantMessageId,
  //   conversationId,
  //   content: aiResponse,
  //   role: 'assistant',
  //   timestamp: new Date()
  // });

  // 7. Retourner la réponse au frontend
  res.json({
    id: assistantMessageId,
    conversationId: conversationId,  // IMPORTANT: même ID qu'en entrée
    content: aiResponse,
    role: 'assistant',
    timestamp: new Date().toISOString()
  });
});
```

### Étape 2: Configurer CORS

Le frontend tourne sur `http://localhost:4200` en développement.

**Node.js/Express**:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['POST', 'OPTIONS'],
  credentials: true
}));
```

**Python/Flask**:
```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:4200"])
```

**NestJS**:
```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true
});
```

### Étape 3: Tester l'Endpoint

**Avec curl**:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "message": "Bonjour"
  }'
```

**Réponse attendue**:
```json
{
  "id": "msg-1729459201-xyz789",
  "conversationId": "test-123",
  "content": "Bonjour ! Comment puis-je vous aider ?",
  "role": "assistant",
  "timestamp": "2025-10-22T14:30:01.000Z"
}
```

### Étape 4: Connecter le Frontend

**Modifier** `src/app/core/services/chat-api.service.ts`:

```typescript
// Ligne 16
private apiUrl = 'http://localhost:3000/api'; // Votre URL backend

// Puis décommenter les lignes 34-37 et commenter 40-46
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
```

---

## 🗄️ Recommandations Base de Données

### Option 1: Stockage Simple (Recommandé pour MVP)

**Ne stockez QUE l'historique** pour le contexte IA:

```javascript
// Collection: messages
{
  _id: ObjectId,
  conversationId: "conv-1729459200-k8j3h2l9q",
  role: "user" | "assistant",
  content: "Message text...",
  timestamp: ISODate("2025-10-22T14:30:01.000Z")
}

// Index recommandé
db.messages.createIndex({ conversationId: 1, timestamp: 1 })
```

**Pourquoi ?**
- Le frontend gère déjà tout dans LocalStorage
- Vous avez juste besoin de l'historique pour construire le contexte IA
- Pas besoin de synchroniser avec le frontend

### Option 2: Stockage Complet

Si vous voulez synchroniser conversations entre appareils:

```javascript
// Collection: conversations
{
  _id: ObjectId,
  conversationId: "conv-1729459200-k8j3h2l9q", // ID du frontend
  userId: "user-123", // Si vous avez de l'authentification
  title: "Nouvelle conversation",
  createdAt: ISODate,
  updatedAt: ISODate
}

// Collection: messages (idem Option 1)
```

---

## 🤖 Intégration IA/LLM

### Contexte Conversationnel

Le frontend envoie **UN message à la fois**. Pour maintenir le contexte:

```javascript
async function callYourAI(conversationId, newMessage) {
  // 1. Récupérer l'historique
  const history = await db.messages
    .find({ conversationId })
    .sort({ timestamp: 1 })
    .toArray();

  // 2. Construire le contexte pour l'IA
  const messages = [
    { role: 'system', content: 'Tu es un assistant juridique...' },
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: newMessage }
  ];

  // 3. Appeler l'IA
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages
  });

  return response.choices[0].message.content;
}
```

### Exemples Providers

**OpenAI**:
```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: contextMessages
});

return completion.choices[0].message.content;
```

**Anthropic Claude**:
```javascript
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: contextMessages
});

return message.content[0].text;
```

**Ollama (Local)**:
```javascript
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama2',
    messages: contextMessages
  })
});

const data = await response.json();
return data.message.content;
```

---

## ⚠️ Gestion des Erreurs

### Erreurs à Gérer

**400 Bad Request**: Champs manquants
```json
{
  "error": "conversationId and message are required"
}
```

**500 Internal Server Error**: Erreur IA/DB
```json
{
  "error": "An error occurred processing your request"
}
```

**503 Service Unavailable**: IA indisponible
```json
{
  "error": "AI service temporarily unavailable"
}
```

### Côté Frontend

Le frontend gère déjà les erreurs:
```typescript
error: (error) => {
  console.error('Error sending message:', error);
  this.messageService.updateMessage(
    assistantMessage.id,
    'Désolé, une erreur s\'est produite. Veuillez réessayer.'
  );
}
```

---

## 🔒 Sécurité (Optionnel pour MVP)

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes par IP
});

app.use('/api/chat', limiter);
```

### Validation Input

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/chat',
  body('conversationId').isString().notEmpty(),
  body('message').isString().trim().notEmpty().isLength({ max: 5000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ...
  }
);
```

---

## 🧪 Tests

### Test Manuel

1. **Démarrer votre backend**
   ```bash
   # Selon votre stack
   npm start  # ou python app.py, etc.
   ```

2. **Tester avec curl**
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"conversationId":"test-123","message":"Bonjour"}'
   ```

3. **Connecter le frontend**
   - Modifier `apiUrl` dans `chat-api.service.ts`
   - Lancer `npm start`
   - Créer une conversation et envoyer un message
   - Vérifier dans Network (F12) que la requête est envoyée

### Vérifications

✅ Status code 200
✅ Response contient tous les champs requis
✅ `conversationId` dans la réponse = `conversationId` dans la requête
✅ `role` = "assistant"
✅ `timestamp` au format ISO 8601
✅ CORS headers présents
✅ Pas d'erreurs CORS dans la console frontend

---

## 📦 Checklist d'Intégration

### Backend
- [ ] Endpoint POST /api/chat créé
- [ ] Accepte `{ conversationId, message }`
- [ ] Retourne `{ id, conversationId, content, role, timestamp }`
- [ ] CORS configuré pour `http://localhost:4200`
- [ ] Timestamp au format ISO 8601
- [ ] Gestion des erreurs (try/catch)
- [ ] IA/LLM intégrée et fonctionnelle
- [ ] Historique conversationnel géré

### Frontend
- [ ] `apiUrl` configurée dans `chat-api.service.ts`
- [ ] Lignes de code HTTP décommentées
- [ ] Mock code commenté
- [ ] Test en conditions réelles effectué

### Tests
- [ ] curl fonctionne
- [ ] Frontend reçoit les réponses
- [ ] Messages s'affichent correctement
- [ ] Édition de message fonctionne
- [ ] Stop génération fonctionne
- [ ] Pas d'erreurs dans la console

---

## 🚀 Exemple Backend Complet (Node.js/Express)

```javascript
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// Stockage en mémoire (remplacer par DB)
const conversations = new Map();

// Endpoint principal
app.post('/api/chat', async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    // Validation
    if (!conversationId || !message) {
      return res.status(400).json({
        error: 'conversationId and message are required'
      });
    }

    // Récupérer ou créer l'historique
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }
    const history = conversations.get(conversationId);

    // Ajouter le message user
    history.push({ role: 'user', content: message });

    // Construire le contexte
    const messages = [
      {
        role: 'system',
        content: 'Tu es un assistant juridique spécialisé en droit sénégalais.'
      },
      ...history
    ];

    // Appeler OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 1000
    });

    const aiResponse = completion.choices[0].message.content;

    // Ajouter la réponse à l'historique
    history.push({ role: 'assistant', content: aiResponse });

    // Générer ID
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Retourner la réponse
    res.json({
      id: messageId,
      conversationId: conversationId,
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'An error occurred processing your request'
    });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

---

## 📞 Support

### Fichiers Frontend Importants

- `src/app/core/services/chat-api.service.ts` - Service API
- `src/app/core/models/message.model.ts` - Modèle Message
- `src/app/core/models/conversation.model.ts` - Modèle Conversation
- `src/app/core/interfaces/chat-api.interface.ts` - Contrat API
- `src/app/features/chat/chat.component.ts` - Logique du chat

### Questions Fréquentes

**Q: Dois-je sauvegarder les conversations en DB ?**
R: Non obligatoire pour MVP. Le frontend gère tout. Mais recommandé pour sync multi-appareils.

**Q: Le frontend envoie-t-il tout l'historique ?**
R: Non, seulement le nouveau message. Vous devez gérer l'historique côté backend.

**Q: Puis-je changer le format de l'API ?**
R: Oui, mais vous devrez aussi modifier `chat-api.service.ts` côté frontend.

**Q: Comment implémenter le streaming ?**
R: Pas supporté pour l'instant. L'architecture actuelle attend une réponse complète.

---

**Document créé le 2025-10-22 pour l'adaptation du backend Legichat**
