# 💬 LegiChat UI

**Interface utilisateur moderne pour chatbot juridique Burkina Faso**

Frontend Angular 20 + Backend Flask avec Mistral AI et FAISS RAG

---

## 🎯 Fonctionnalités

✅ **Chat intelligent** avec IA juridique (Burkina Faso)
✅ **Rendu Markdown** (gras, italique, listes, code, liens)
✅ **Sources juridiques** affichées avec scores de pertinence
✅ **Types de réponse** différenciés visuellement (bleu/vert/violet/orange/rouge)
✅ **Conversations multiples** avec historique persistant
✅ **Édition inline** des messages utilisateur
✅ **Arrêt génération** pendant les réponses
✅ **Responsive** mobile + desktop avec menu burger
✅ **State management** avec Angular Signals
✅ **Architecture SOLID** et Clean Code

---

## ⚡ Démarrage Rapide

### Installation
```bash
npm install
```

### Lancement
```bash
npm start
# Ouvre http://localhost:4200
```

### Build Production
```bash
npm run build
# Output dans dist/
```

---

## 🔌 Intégration Backend

**👉 Voir [API_INTEGRATION.md](./API_INTEGRATION.md) pour le guide complet**

**Configuration rapide** :

1. **Démarrer le backend Flask** (port 5000)
   ```bash
   cd /chemin/vers/LegiChatBackend
   python app.py
   ```

2. **L'URL est déjà configurée** dans `src/app/core/services/chat-api.service.ts` :
   ```typescript
   private apiUrl = 'http://localhost:5000/api';
   ```

3. **Tester la connexion** :
   ```bash
   curl http://localhost:5000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"conversationId":"test","message":"Bonjour"}'
   ```

---

## 📋 Documentation

| Fichier | Description |
|---------|-------------|
| **[API_INTEGRATION.md](./API_INTEGRATION.md)** | Guide complet d'intégration backend (endpoints, formats, tests) |
| **[CHANGELOG.md](./CHANGELOG.md)** | Historique des changements et versions |
| **README.md** | Ce fichier - Vue d'ensemble du projet |

---

## 📁 Structure du Projet

```
src/app/
├── core/                          # Logique métier
│   ├── models/                    # Message, Conversation, ResponseMetadata
│   ├── services/                  # ChatApiService, MessageService, ConversationService
│   └── interfaces/                # IChatApi
├── features/                      # Fonctionnalités principales
│   ├── chat/                      # Interface de chat
│   └── conversation-list/         # Liste des conversations
└── shared/                        # Composants partagés
    ├── components/                # Message, ChatInput
    └── pipes/                     # MarkdownPipe
```

---

## 🎨 Stack Technique

**Frontend** :
- Angular 20.3.6 (Standalone Components)
- TypeScript 5.6
- SCSS
- RxJS
- Marked (Markdown rendering)

**Backend** :
- Flask (Python)
- Mistral AI (LLM)
- FAISS (Vector search)
- Contexte juridique : Burkina Faso

---

## 🔧 Commandes Utiles

```bash
# Développement
npm start                  # Serveur dev (port 4200)
npm run build             # Build production
npm test                  # Lancer les tests

# Vérifications
npm run lint              # Linter
ng build --configuration production  # Build optimisé
```

---

## 🧩 Fonctionnalités Détaillées

### 1. Affichage des Messages

- **Markdown** : `**gras**`, `*italique*`, `[liens](url)`, listes, code
- **Sources juridiques** : Documents consultés avec pertinence (%)
- **Types visuels** :
  - 🔵 Bleu = Réponse juridique (`legal_answer`)
  - 🟢 Vert = Lien document (`document_link`)
  - 🟣 Violet = Résumé (`document_summary`)
  - 🟠 Orange = Non trouvé (`not_found`)
  - 🔴 Rouge = Erreur (`error`)

### 2. Gestion des Conversations

- Création/suppression de conversations
- Historique sauvegardé dans LocalStorage
- Contexte maintenu par le backend (RAM)
- Sélection rapide via sidebar

### 3. Édition et Actions

- **Édition inline** : Cliquer ✏️ sur message utilisateur
- **Copie** : Cliquer 📋 pour copier le texte
- **Stop** : Bouton ■ pour arrêter la génération

### 4. Responsive Design

- **Mobile** (<1080px) : Menu burger, layout adapté
- **Desktop** (>1080px) : Sidebar fixe, plein écran
- Animations fluides et transitions

---

## 🚀 Déploiement Production

### Frontend
1. Build : `npm run build`
2. Déployer `dist/legichat-ui/` sur Netlify/Vercel
3. Configurer domaine

### Backend
1. Déployer Flask sur Heroku/AWS
2. Obtenir domaine avec HTTPS
3. Mettre à jour `apiUrl` dans le frontend
4. Migrer historique vers MongoDB/PostgreSQL

---

## 🐛 Dépannage

**Port 4200 déjà utilisé** :
```bash
ng serve --port 4201
```

**Erreurs d'installation** :
```bash
rm -rf node_modules package-lock.json
npm install
```

**Backend non accessible** :
- Vérifier que `python app.py` tourne
- Vérifier CORS dans backend : `origins=["http://localhost:4200"]`
- Tester avec curl

**Markdown non rendu** :
- Déjà implémenté avec `MarkdownPipe`
- Vérifie que `marked` est installé : `npm list marked`

---

## 📊 Statistiques

- **Bundle size** : 107 kB (gzipped)
- **Components** : 6 standalone
- **Services** : 3 (API, Messages, Conversations)
- **Pipes** : 1 (Markdown)
- **Lines of code** : ~2500

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche : `git checkout -b feature/nom`
3. Commit : `git commit -m "Description"`
4. Push : `git push origin feature/nom`
5. Créer une Pull Request

---

## 📄 Licence

Projet privé - Tous droits réservés

---

## 👨‍💻 Développé avec

Angular 20 + TypeScript + SCSS + RxJS + Marked

Intégration Backend Flask + Mistral AI + FAISS

---

**Dernière mise à jour** : 2025-10-23
**Version** : 1.0.0
**Auteur** : LegiChat Team
