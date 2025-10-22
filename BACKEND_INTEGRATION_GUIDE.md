# 🔗 Guide d'Intégration Backend - LegiChat

**Status**: ✅ **Backend COMPATIBLE - Prêt à connecter**

---

## 🎉 Bonne Nouvelle !

Votre backend Flask est **déjà 100% compatible** avec le frontend Angular 20 ! Aucune modification backend nécessaire.

### Compatibilité Vérifiée

| Critère | Frontend Attend | Backend Fournit | Status |
|---------|----------------|-----------------|--------|
| Endpoint | `POST /api/chat` | ✅ `POST /api/chat` | ✅ |
| Request Format | `{conversationId, message}` | ✅ Identique | ✅ |
| Response Format | `{id, conversationId, content, role, timestamp}` | ✅ Identique | ✅ |
| CORS | `http://localhost:4200` | ✅ Configuré | ✅ |
| Timestamp | ISO 8601 | ✅ Format correct | ✅ |
| Role | `"assistant"` | ✅ Toujours assistant | ✅ |
| Conversation Context | Géré backend | ✅ Stockage en RAM | ✅ |

---

## ⚡ Intégration en 3 Étapes

### Étape 1: Démarrer le Backend

```bash
cd /chemin/vers/LegiChatBackend
python app.py
```

**Vérification**:
```bash
# Le serveur doit afficher:
# * Running on http://localhost:5000
```

### Étape 2: Configurer le Frontend

**Fichier**: `src/app/core/services/chat-api.service.ts`

**AVANT** (lignes 16-46):
```typescript
@Injectable({
  providedIn: 'root'
})
export class ChatApiService implements IChatApi {
  private apiUrl = ''; // ← VIDE

  constructor(private http: HttpClient) {}

  sendMessage(conversationId: string, message: string): Observable<Message> {
    // Mock response
    const mockResponse = createMessage(
      conversationId,
      `Voici une réponse simulée...`,
      'assistant'
    );
    return of(mockResponse).pipe(delay(1000));
  }
}
```

**APRÈS**:
```typescript
@Injectable({
  providedIn: 'root'
})
export class ChatApiService implements IChatApi {
  private apiUrl = 'http://localhost:5000/api'; // ← URL du backend

  constructor(private http: HttpClient) {}

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

// Ajouter l'interface si elle n'existe pas
interface ChatResponse {
  id: string;
  conversationId: string;
  content: string;
  role: string;
  timestamp: string;
}
```

### Étape 3: Démarrer le Frontend

```bash
cd /home/user/LegiChatUi
npm start
```

**Vérification**: Ouvrez http://localhost:4200

---

## 🧪 Test Complet

### 1. Test Backend Seul (curl)

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-integration-123",
    "message": "Bonjour, comment créer une entreprise au Sénégal ?"
  }'
```

**Réponse attendue**:
```json
{
  "id": "msg-1730000000000-abc123xyz",
  "conversationId": "test-integration-123",
  "content": "Pour créer une entreprise au Sénégal...",
  "role": "assistant",
  "timestamp": "2025-10-22T14:30:01.123Z"
}
```

### 2. Test Frontend Complet

1. **Démarrer backend**: `python app.py`
2. **Démarrer frontend**: `npm start`
3. **Ouvrir**: http://localhost:4200
4. **Actions**:
   - ✅ Créer une nouvelle conversation (bouton "Nouveau chat")
   - ✅ Envoyer un message: "Quelle est la procédure pour créer une entreprise ?"
   - ✅ Vérifier que la réponse s'affiche (avec contexte juridique)
   - ✅ Envoyer un message de suivi: "Quels sont les coûts ?"
   - ✅ Vérifier que le contexte est maintenu

5. **Console navigateur (F12)**:
   - Onglet Network → Rechercher `/api/chat`
   - Vérifier Status: 200 OK
   - Vérifier Response avec les bons champs

---

## 🔄 Flux de Données Complet

### Premier Message

```
[Frontend - Angular]
User: "Quelle est la procédure pour créer une entreprise ?"
   ↓
conversationId = "conv-1729459200-k8j3h2l9q" (généré)
   ↓
POST http://localhost:5000/api/chat
{
  "conversationId": "conv-1729459200-k8j3h2l9q",
  "message": "Quelle est la procédure pour créer une entreprise ?"
}

[Backend - Flask]
   ↓
Reçoit requête /api/chat
   ↓
Crée historique pour conversationId dans RAM:
conversations_history["conv-1729459200-k8j3h2l9q"] = []
   ↓
Encode question avec sentence-transformers
   ↓
Recherche dans FAISS index (top 10 articles similaires)
   ↓
Construit contexte avec articles pertinents
   ↓
Appelle Mistral AI avec contexte + question
   ↓
Génère ID: "msg-1729459201-xyz789"
   ↓
Sauvegarde dans historique:
{role: "user", content: "..."},
{role: "assistant", content: "..."}
   ↓
Retourne réponse JSON:
{
  "id": "msg-1729459201-xyz789",
  "conversationId": "conv-1729459200-k8j3h2l9q",
  "content": "Pour créer une entreprise au Sénégal, vous devez...",
  "role": "assistant",
  "timestamp": "2025-10-22T14:30:01.000Z"
}

[Frontend - Angular]
   ↓
Reçoit réponse 200 OK
   ↓
Convertit timestamp string → Date object
   ↓
Met à jour le message assistant dans l'UI
   ↓
Désactive isLoading
   ↓
Affiche à l'utilisateur
```

### Message de Suivi (Contexte)

```
[Frontend]
User: "Quels sont les coûts ?"
   ↓
MÊME conversationId = "conv-1729459200-k8j3h2l9q"
   ↓
POST http://localhost:5000/api/chat
{
  "conversationId": "conv-1729459200-k8j3h2l9q",
  "message": "Quels sont les coûts ?"
}

[Backend]
   ↓
Récupère historique existant de:
conversations_history["conv-1729459200-k8j3h2l9q"]
   ↓
Contexte =
[
  {role: "user", content: "Quelle est la procédure pour créer une entreprise ?"},
  {role: "assistant", content: "Pour créer une entreprise..."},
  {role: "user", content: "Quels sont les coûts ?"}
]
   ↓
RAG + Mistral AI avec contexte complet
   ↓
Réponse contextuelle: "Les coûts pour créer une entreprise..."
(sait qu'on parle de création d'entreprise)
   ↓
Ajoute à l'historique
   ↓
Retourne réponse

[Frontend]
   ↓
Affiche réponse contextuelle
```

---

## 🎨 Fonctionnalités Backend Spéciales

### 1. Recherche de Documents

**Frontend envoie**:
```json
{
  "conversationId": "conv-123",
  "message": "cherche loi 2023-15"
}
```

**Backend répond** avec lien HTML:
```json
{
  "content": "📄 Voici le document demandé : <a href='http://localhost:5000/pdfs/loi-2023-15.pdf' target='_blank'>cliquer ici</a><br>Souhaitez-vous un résumé ? (oui/non)",
  ...
}
```

**Frontend affiche** le lien cliquable dans la bulle de message.

### 2. Résumé de Document

**Conversation**:
```
User: "cherche loi 2023-15"
Assistant: "📄 Voici le document... Souhaitez-vous un résumé ? (oui/non)"
User: "oui"
Assistant: "Résumé du document : Ce décret porte sur..."
```

**Backend détecte** "oui" et génère automatiquement le résumé du dernier document.

### 3. Q&A Juridique (RAG)

**Question**: "Quelle est la durée du congé maternité au Sénégal ?"

**Backend**:
1. Encode la question
2. Recherche dans FAISS les articles pertinents
3. Contexte = top 10 articles similaires
4. Mistral génère réponse avec citations

**Réponse**: "Selon l'article 42 du Code du Travail, le congé maternité est de 14 semaines..."

---

## 🔐 Configuration CORS (Déjà Fait)

**Backend** (`app.py` ligne 29):
```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:4200"], supports_credentials=True)
```

✅ Déjà configuré pour le frontend Angular sur port 4200.

**Si erreurs CORS**:
1. Vérifier que backend tourne sur port 5000
2. Vérifier que frontend tourne sur port 4200
3. Redémarrer le backend après modifications

---

## 📦 Modifications Frontend Nécessaires

### Fichier à Modifier

**`src/app/core/services/chat-api.service.ts`**

### Changements Exacts

**Ligne 16** (changer):
```typescript
// AVANT
private apiUrl = '';

// APRÈS
private apiUrl = 'http://localhost:5000/api';
```

**Lignes 31-46** (remplacer):
```typescript
// AVANT (SUPPRIMER)
sendMessage(conversationId: string, message: string): Observable<Message> {
  const mockResponse = createMessage(
    conversationId,
    `Voici une réponse simulée à votre message: "${message}". Cette réponse sera remplacée par l'API réelle de Legichat.`,
    'assistant'
  );
  return of(mockResponse).pipe(delay(1000));
}

// APRÈS (UTILISER)
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

**Ligne 49** (ajouter après la classe):
```typescript
interface ChatResponse {
  id: string;
  conversationId: string;
  content: string;
  role: string;
  timestamp: string;
}
```

---

## ✅ Checklist d'Intégration

### Backend
- [x] Backend Flask existant
- [x] Endpoint POST /api/chat fonctionnel
- [x] Format requête/réponse compatible
- [x] CORS configuré
- [x] Mistral AI intégré
- [x] FAISS RAG fonctionnel
- [x] Gestion contexte conversationnel

### Frontend
- [ ] URL backend configurée dans `chat-api.service.ts`
- [ ] Code mock remplacé par code HTTP
- [ ] Interface `ChatResponse` ajoutée
- [ ] Test effectué

### Tests
- [ ] Backend démarre sans erreur
- [ ] curl teste OK
- [ ] Frontend se connecte au backend
- [ ] Message envoyé et réponse reçue
- [ ] Contexte conversationnel fonctionne
- [ ] Pas d'erreurs CORS dans console

---

## 🐛 Dépannage

### Erreur: "Failed to fetch"

**Cause**: Backend non démarré ou mauvaise URL

**Solution**:
1. Vérifier que `python app.py` tourne
2. Vérifier URL: `http://localhost:5000/api`
3. Tester avec curl d'abord

### Erreur: CORS Policy

**Cause**: CORS mal configuré

**Solution**:
```python
# Vérifier dans app.py:
CORS(app, origins=["http://localhost:4200"], supports_credentials=True)
```

### Réponse vide ou erreur 500

**Cause**:
- Mistral API key invalide
- FAISS index manquant
- Erreur dans le backend

**Solution**:
1. Vérifier logs backend dans le terminal
2. Vérifier clé API Mistral
3. Vérifier que dossier `faiss_index/` existe

### Pas de contexte conversationnel

**Cause**: conversationId différent entre messages

**Solution**: Le frontend génère un seul conversationId par conversation et le réutilise.

---

## 🚀 Code Complet à Utiliser

### chat-api.service.ts (Version Finale)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IChatApi } from '../interfaces/chat-api.interface';
import { Message } from '../models/message.model';

/**
 * Chat API Service implementing IChatApi interface
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
```

---

## 📊 Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 20)                     │
│                   http://localhost:4200                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Interface                                              │
│  ├── ConversationList (sidebar)                             │
│  ├── ChatComponent (main)                                   │
│  │   ├── MessageComponent (bubbles)                         │
│  │   └── ChatInputComponent (input)                         │
│  │                                                           │
│  Services                                                    │
│  ├── ConversationService → LocalStorage                     │
│  ├── MessageService → LocalStorage                          │
│  └── ChatApiService → HTTP POST                             │
│           ↓                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ HTTP POST /api/chat
            │ {conversationId, message}
            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Flask + Python)                  │
│                   http://localhost:5000                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Endpoint: POST /api/chat                                   │
│  ├── Validation (conversationId, message)                   │
│  ├── Conversation History (RAM)                             │
│  │   └── conversations_history = {...}                      │
│  │                                                           │
│  AI Pipeline                                                 │
│  ├── 1. Detect Intent (search/summarize/qa)                 │
│  ├── 2. Document Search (if triggered)                      │
│  ├── 3. RAG Processing                                      │
│  │   ├── Encode question (sentence-transformers)            │
│  │   ├── Search FAISS index                                 │
│  │   └── Retrieve top 10 articles                           │
│  ├── 4. Build Context                                       │
│  │   ├── System prompt                                      │
│  │   ├── Retrieved articles                                 │
│  │   └── Conversation history                               │
│  └── 5. Call Mistral AI                                     │
│      └── Generate response                                  │
│                                                              │
│  Response: {id, conversationId, content, role, timestamp}   │
│           ↓                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ 200 OK JSON
            ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Mistral AI API                                              │
│  └── Model: mistral-large-latest                            │
│                                                              │
│  FAISS Vector Database                                       │
│  └── Indexed legal documents                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Étapes Suivantes

### 1. Intégration Immédiate (Aujourd'hui)
```bash
# Terminal 1: Backend
cd /chemin/vers/LegiChatBackend
python app.py

# Terminal 2: Frontend
cd /home/user/LegiChatUi
# Modifier chat-api.service.ts (voir ci-dessus)
npm start

# Browser
http://localhost:4200
# Tester: créer conversation + envoyer message
```

### 2. Tests Complets
- [ ] Message simple
- [ ] Recherche de document ("cherche loi 2023-15")
- [ ] Résumé de document ("oui")
- [ ] Question juridique avec contexte
- [ ] Édition de message
- [ ] Stop génération

### 3. Production (Plus tard)
- [ ] Déployer backend sur serveur (Heroku, AWS, etc.)
- [ ] Obtenir nom de domaine
- [ ] Configurer HTTPS
- [ ] Mettre à jour `apiUrl` avec URL production
- [ ] Implémenter authentification
- [ ] Migrer conversations vers base de données
- [ ] Ajouter rate limiting

---

## 📞 Support

**Backend**: Voir `Backend API Reference.md`

**Frontend**: Voir `FRONTEND_TO_BACKEND_SPECS.md`

**Problèmes**:
1. Vérifier que les deux serveurs tournent
2. Vérifier les logs dans les deux terminaux
3. Vérifier Console navigateur (F12)
4. Tester backend seul avec curl d'abord

---

**Status**: ✅ Backend compatible, prêt à intégrer
**Date**: 2025-10-22
**Version Frontend**: Angular 20.3.6
**Version Backend**: Flask 2.0 + Mistral AI + FAISS
