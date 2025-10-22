# 🔗 Guide d'Intégration Backend

Ce guide explique comment utiliser les fichiers de spécification pour créer le backend de Legichat.

## 📁 Fichiers Disponibles

### 1. `BACKEND_SPECIFICATIONS.md` (Document Principal)
**Fichier de référence complet** contenant :
- ✅ Architecture frontend détaillée
- ✅ Modèles de données TypeScript
- ✅ Tous les endpoints API avec exemples de requêtes/réponses
- ✅ Flux de données complet
- ✅ Schémas MongoDB recommandés
- ✅ Options d'intégration IA (OpenAI, Claude, Ollama)
- ✅ Structure de projet backend recommandée
- ✅ Sécurité, tests, déploiement

**À faire lire en priorité à Claude Code dans votre session backend.**

### 2. `PROMPT_BACKEND.txt` (Prompt Prêt à l'Emploi)
**Prompt concis** à copier-coller directement dans Claude Code pour démarrer la session backend.

Contient :
- Contexte du projet
- Tâches principales par ordre de priorité
- Contraintes techniques
- Instructions de démarrage

### 3. `INTEGRATION_API.md` (Existant)
Guide technique pour connecter le service frontend à l'API backend.

## 🚀 Comment Utiliser Ces Fichiers

### Option 1 : Démarrage Rapide (Recommandé)

1. **Ouvrez une nouvelle session Claude Code** dans votre projet backend

2. **Copiez le contenu de `PROMPT_BACKEND.txt`**

3. **Collez-le dans Claude Code** et ajustez le chemin vers les fichiers :
   ```
   Remplacez :
   /chemin/vers/LegiChatUi/BACKEND_SPECIFICATIONS.md

   Par le chemin réel, par exemple :
   /home/user/LegiChatUi/BACKEND_SPECIFICATIONS.md
   ```

4. **Lancez la session** - Claude Code va :
   - Lire automatiquement `BACKEND_SPECIFICATIONS.md`
   - Analyser les modèles de données
   - Proposer une architecture backend
   - Créer les endpoints API nécessaires

### Option 2 : Démarrage Manuel

Si vous préférez guider Claude Code étape par étape :

1. **Session backend** : "Lis le fichier `/home/user/LegiChatUi/BACKEND_SPECIFICATIONS.md`"

2. Ensuite : "Propose-moi une architecture backend NestJS compatible avec ces spécifications"

3. Puis : "Crée l'endpoint POST /api/chat avec les formats exacts du document"

4. Enfin : "Intègre OpenAI GPT-4 pour générer les réponses de l'assistant"

## 📋 Checklist d'Implémentation Backend

### Phase 1 : MVP (2-3 heures)
- [ ] Lire `BACKEND_SPECIFICATIONS.md` en entier
- [ ] Créer la structure de projet (NestJS recommandé)
- [ ] Implémenter l'endpoint `POST /api/chat` avec réponses simulées
- [ ] Configurer MongoDB (schémas Conversation + Message)
- [ ] Tester avec Postman/curl

### Phase 2 : Intégration IA (2-4 heures)
- [ ] Choisir le provider IA (OpenAI GPT-4 / Claude / Ollama)
- [ ] Créer le service IA avec gestion de l'historique
- [ ] Implémenter les prompts système pour Legichat
- [ ] Tester les réponses de l'IA
- [ ] Connecter le frontend au backend réel

### Phase 3 : Fonctionnalités Complètes (4-6 heures)
- [ ] Endpoints CRUD pour conversations
- [ ] Endpoint GET /conversations/:id/messages
- [ ] Authentification JWT (optionnel)
- [ ] Validation des entrées (Joi/Zod)
- [ ] Gestion des erreurs

### Phase 4 : Production (variables)
- [ ] Rate limiting
- [ ] Caching Redis
- [ ] Logging (Winston/Pino)
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger
- [ ] Déploiement (Docker, Render, Railway, etc.)

## 🔌 Connexion Frontend ↔ Backend

### 1. Configuration de l'URL API (Frontend)

Dans le frontend Angular, modifiez :

```typescript
// src/app/core/services/chat-api.service.ts

export class ChatApiService implements IChatApi {
  private apiUrl = 'http://localhost:3000/api'; // URL de votre backend

  // OU pour la production :
  // private apiUrl = environment.apiUrl;
}
```

### 2. Configuration CORS (Backend)

Dans votre backend, autorisez le frontend :

```typescript
// NestJS exemple
app.enableCors({
  origin: ['http://localhost:4200', 'https://legichat.com'],
  credentials: true
});

// Express exemple
app.use(cors({
  origin: ['http://localhost:4200', 'https://legichat.com'],
  credentials: true
}));
```

### 3. Test de Connexion

**Backend en local** : `http://localhost:3000`

**Test avec curl** :
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "message": "Bonjour Legichat"
  }'
```

**Réponse attendue** :
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "conversationId": "test-123",
  "content": "Bonjour! Comment puis-je vous aider avec des questions juridiques?",
  "role": "assistant",
  "timestamp": "2025-10-21T10:00:00.000Z"
}
```

### 4. Démarrage des Serveurs

**Terminal 1 - Backend** :
```bash
cd /chemin/vers/backend
npm install
npm run start:dev  # Port 3000
```

**Terminal 2 - Frontend** :
```bash
cd /home/user/LegiChatUi
npm start  # Port 4200
```

Ouvrez http://localhost:4200 et testez le chat !

## 🤖 Choix du Provider IA

### Option 1 : OpenAI GPT-4 (Recommandé)
**Avantages** :
- Excellente qualité de réponses
- API stable et bien documentée
- Bonne gestion du contexte français/sénégalais

**Coût** : ~$0.03 par 1K tokens (entrée) + $0.06 par 1K tokens (sortie)

**Setup** :
```bash
npm install openai
```

### Option 2 : Anthropic Claude
**Avantages** :
- Très bon en français
- Context window de 200K tokens
- Excellent pour les conversations longues

**Coût** : ~$0.015 par 1K tokens (entrée) + $0.075 par 1K tokens (sortie)

**Setup** :
```bash
npm install @anthropic-ai/sdk
```

### Option 3 : Ollama (Local, Gratuit)
**Avantages** :
- 100% gratuit
- Pas de limite de requêtes
- Données privées (local)
- Modèles : Llama 3.2, Mistral, etc.

**Inconvénients** :
- Qualité inférieure aux modèles commerciaux
- Requiert un GPU puissant pour de bonnes performances

**Setup** :
```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger un modèle
ollama pull llama3.2

# Lancer le serveur
ollama serve
```

## 📚 Ressources Supplémentaires

### Documentation Frontend
- `README.md` : Documentation générale du frontend
- `INTEGRATION_API.md` : Guide d'intégration API
- `RESPONSIVE.md` : Détails du design responsive
- `GUIDE_DEMARRAGE.md` : Guide de démarrage rapide

### Exemples de Code
- `src/app/core/models/` : Modèles de données TypeScript
- `src/app/core/services/chat-api.service.ts` : Service API frontend
- `src/app/core/interfaces/chat-api.interface.ts` : Interface IChatApi

### Vidéos/Tutoriels Recommandés
- NestJS : https://docs.nestjs.com/
- MongoDB + Mongoose : https://mongoosejs.com/docs/
- OpenAI API : https://platform.openai.com/docs/
- Anthropic Claude : https://docs.anthropic.com/

## 💡 Conseils Pratiques

### 1. Commencez Simple
Ne créez pas toute l'architecture d'un coup. Commencez par :
1. Un simple endpoint POST /api/chat avec réponse fixe "Hello World"
2. Connectez-le au frontend pour vérifier que ça marche
3. Ajoutez MongoDB
4. Intégrez l'IA
5. Ajoutez les fonctionnalités avancées

### 2. Testez Régulièrement
Après chaque étape, testez avec :
- Postman pour tester l'API directement
- Le frontend pour tester l'intégration complète

### 3. Logs Partout
Ajoutez des logs pour déboguer facilement :
```typescript
console.log('[CHAT] Received message:', message);
console.log('[AI] Generating response...');
console.log('[DB] Saving to database...');
```

### 4. Variables d'Environnement
Ne committez JAMAIS vos clés API ! Utilisez `.env` :
```bash
# .env
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb://localhost:27017/legichat
```

## 🐛 Résolution de Problèmes Courants

### Erreur CORS
**Symptôme** : "Access-Control-Allow-Origin" error dans la console frontend

**Solution** :
```typescript
// Backend - Activer CORS
app.enableCors({
  origin: 'http://localhost:4200'
});
```

### Erreur de Format JSON
**Symptôme** : Frontend ne reçoit pas les données correctement

**Solution** : Vérifiez que les champs correspondent EXACTEMENT à `BACKEND_SPECIFICATIONS.md` :
- `conversationId` (pas `conversation_id`)
- `role` doit être `"user"` ou `"assistant"` (pas `"bot"`)
- `timestamp` en format ISO 8601

### MongoDB Connection Failed
**Symptôme** : "MongoError: connect ECONNREFUSED"

**Solution** :
```bash
# Vérifier que MongoDB est lancé
sudo systemctl status mongodb

# Ou avec Docker
docker run -d -p 27017:27017 mongo
```

## ✅ Validation Finale

Avant de considérer le backend terminé, vérifiez :

1. **Endpoint POST /api/chat fonctionne** avec le format exact du spec
2. **CORS configuré** pour le frontend (localhost:4200)
3. **MongoDB connecté** et sauvegarde les messages
4. **IA génère des réponses** pertinentes en français
5. **Frontend se connecte** sans erreur
6. **Messages s'affichent** dans les bulles du chat
7. **Conversations persistent** dans la base de données

## 📞 Support

Si vous rencontrez des problèmes :

1. **Consultez** `BACKEND_SPECIFICATIONS.md` pour les détails techniques
2. **Vérifiez** les logs du backend ET du frontend
3. **Testez** l'API avec Postman isolément
4. **Demandez** à Claude Code de déboguer dans votre session backend

---

**Bon développement ! 🚀**

*Créé le 2025-10-21 pour l'intégration backend de Legichat*
