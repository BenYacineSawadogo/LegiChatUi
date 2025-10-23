# 🔌 Guide d'Intégration API - LegiChat

**Frontend Angular 20 ↔ Backend Flask (Burkina Faso)**

---

## ⚡ Démarrage Rapide

### Backend (Port 5000)
```bash
cd /chemin/vers/LegiChatBackend
python app.py
```

### Frontend (Port 4200)
```bash
cd /home/user/LegiChatUi
npm start
```

### Vérifier la Connexion
```bash
curl http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test","message":"Bonjour"}'
```

---

## 📡 API Endpoint

### POST /api/chat

**URL** : `http://localhost:5000/api/chat`

**Requête** :
```json
{
  "conversationId": "conv-1729459200-abc",
  "message": "Quels sont les aéroports internationaux au Burkina Faso ?"
}
```

**Réponse** :
```json
{
  "id": "msg-1729459201-xyz",
  "conversationId": "conv-1729459200-abc",
  "content": "Selon l'article 1 de l'arrêté n°016/2023...",
  "role": "assistant",
  "timestamp": "2025-10-23T14:30:01.000Z",
  "metadata": {
    "responseType": "legal_answer",
    "country": "Burkina Faso",
    "sources": [
      {
        "document": "ARRETE_016_2023_ALT",
        "relevance": 0.95
      }
    ]
  }
}
```

---

## 🎨 Types de Réponses

| Type | Description | Rendu Frontend |
|------|-------------|----------------|
| `legal_answer` | Réponse juridique avec sources | Bulle bleue + sources affichées |
| `document_link` | Lien vers document PDF | Bulle verte + lien cliquable |
| `document_summary` | Résumé d'un document | Bulle violette + header "Résumé" |
| `not_found` | Information non trouvée | Bulle orange + icône ⚠️ |
| `error` | Erreur serveur | Bulle rouge + icône ❌ |

---

## 💻 Configuration Frontend

### Service API
**Fichier** : `src/app/core/services/chat-api.service.ts`

```typescript
private apiUrl = 'http://localhost:5000/api';

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
      isLoading: false,
      metadata: response.metadata
    }))
  );
}
```

### Interfaces TypeScript
**Fichier** : `src/app/core/models/message.model.ts`

```typescript
export interface ResponseMetadata {
  responseType: 'legal_answer' | 'document_link' | 'document_summary' | 'not_found' | 'error';
  country: string;
  sources: ResponseSource[];
}

export interface ResponseSource {
  document?: string;
  relevance?: number;
  type?: string;
  numero?: string;
  lien?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  metadata?: ResponseMetadata;
}
```

---

## 🔧 Fonctionnalités Backend

### 1. Recherche de Document
**Commande** : `"cherche loi 2023-015"`

**Réponse** :
- Type : `document_link`
- Contient lien HTML vers PDF
- Propose résumé (oui/non)

### 2. Résumé de Document
**Commande** : `"oui"` (après un document_link)

**Réponse** :
- Type : `document_summary`
- Résumé complet extrait du PDF

### 3. Q&A Juridique (RAG)
**Commande** : Question normale

**Réponse** :
- Type : `legal_answer`
- Recherche FAISS dans documents
- Top 10 articles pertinents
- Génération Mistral AI
- Citations des sources avec scores

---

## 🎯 Contexte Juridique

**Important** : Toutes les réponses concernent le **Burkina Faso** (pas le Sénégal).

- `metadata.country` = `"Burkina Faso"`
- Sources = documents juridiques burkinabè (arrêtés, décrets, lois)

---

## 🧪 Tests

### 1. Test Réponse Juridique
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-1","message":"Quels sont les aéroports internationaux ?"}'
```
→ Doit retourner `responseType: "legal_answer"` avec sources

### 2. Test Recherche Document
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test-2","message":"cherche loi 2023-015"}'
```
→ Doit retourner `responseType: "document_link"` avec lien PDF

### 3. Test Contexte Conversationnel
```bash
# Message 1
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"conv-123","message":"Parle-moi des aéroports"}'

# Message 2 (même conversationId)
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"conv-123","message":"Quels sont leurs horaires ?"}'
```
→ Le backend doit se souvenir du contexte (aéroports)

---

## ✅ Checklist Intégration

**Configuration** :
- [x] Backend tourne sur `http://localhost:5000`
- [x] Frontend configuré avec `apiUrl = 'http://localhost:5000/api'`
- [x] CORS autorise `http://localhost:4200`

**Interfaces** :
- [x] `ResponseMetadata` avec `responseType` et `sources`
- [x] `Message` avec champ `metadata` optionnel
- [x] `ChatResponse` inclut le champ `metadata`

**Service API** :
- [x] Envoie `{conversationId, message}`
- [x] Mappe `response.metadata` vers `Message.metadata`
- [x] Convertit `timestamp` string → Date

**UI** :
- [x] Affichage des sources juridiques
- [x] Rendu Markdown (**gras**, *italique*, listes)
- [x] Styles différenciés par `responseType`
- [x] Animations et responsive design

---

## 🚨 Dépannage

### Erreur CORS
**Symptôme** : `Access-Control-Allow-Origin` dans console

**Solution** : Vérifier dans `app.py` (backend) :
```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:4200"], supports_credentials=True)
```

### Erreur 500
**Symptôme** : Erreur serveur

**Debug** :
1. Vérifier logs backend dans terminal
2. Vérifier clé API Mistral valide
3. Vérifier dossier `faiss_index/` existe

### Pas de Contexte
**Symptôme** : Bot ne se souvient pas

**Cause** : `conversationId` différent entre messages

**Solution** : Frontend doit utiliser le même `conversationId` pour toute la conversation

### Markdown Non Rendu
**Symptôme** : Affichage `**texte**` au lieu de **texte**

**Solution** : Déjà implémenté avec `MarkdownPipe` et `innerHTML`

---

## 📊 Architecture

```
Frontend (Angular 20)                Backend (Flask)
┌────────────────────┐              ┌────────────────────┐
│                    │              │                    │
│  User Interface    │              │  Endpoint          │
│  - Conversations   │              │  POST /api/chat    │
│  - Messages        │              │                    │
│  - Input           │              │  Pipeline          │
│                    │              │  1. Validation     │
│  Services          │   HTTP       │  2. Context        │
│  - ChatApiService ─┼──────────────┼─→ 3. RAG (FAISS)   │
│  - MessageService  │   POST       │  4. Mistral AI     │
│  - ConvService     │              │  5. Response       │
│                    │   JSON       │                    │
│  Storage           │   ←──────────┼─  JSON + metadata  │
│  - LocalStorage    │              │                    │
│                    │              │  Storage           │
└────────────────────┘              │  - RAM (history)   │
                                    │                    │
                                    └────────────────────┘
```

---

## 🔐 Production (À faire plus tard)

### Backend
- [ ] Déployer sur serveur (Heroku, AWS, etc.)
- [ ] Obtenir nom de domaine
- [ ] Configurer HTTPS
- [ ] Migrer historique vers DB (MongoDB/PostgreSQL)
- [ ] Implémenter rate limiting
- [ ] Ajouter authentification (JWT)
- [ ] Mettre clé API en variable d'environnement

### Frontend
- [ ] Mettre à jour `apiUrl` avec URL production
- [ ] Build optimisé : `npm run build`
- [ ] Déployer sur Netlify/Vercel
- [ ] Configurer domaine frontend

---

## 📞 Support

**Fichiers Importants** :
- `README.md` - Documentation générale du projet
- `CHANGELOG.md` - Historique des changements
- `src/app/core/services/chat-api.service.ts` - Service API
- `src/app/core/models/message.model.ts` - Modèles de données

**Backend** : Voir documentation dans `/LegiChatBackend`

---

**Dernière mise à jour** : 2025-10-23
**Version API** : 2.1
**Version Frontend** : Angular 20.3.6
