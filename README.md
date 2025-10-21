# 💬 Legichat UI

Interface utilisateur moderne et élégante pour Legichat, construite avec Angular 20 et suivant les principes SOLID et Clean Code.

## 🎨 Caractéristiques

- ✨ **Interface moderne** similaire à ChatGPT avec design en bulles
- 🎨 **Thème vert et blanc** élégant et professionnel
- 💬 **Gestion de conversations multiples**
- 🔄 **State management** avec Angular Signals
- 📱 **Mobile-first design** avec menu burger et responsive complet
- 🖥️ **Plein écran desktop** - interface occupant 100% de l'espace disponible
- 💭 **Messages en bulles** avec ombres et animations modernes
- ⚡ **Performance optimisée** avec standalone components
- 🏗️ **Architecture SOLID** et Clean Code
- 💾 **Persistance locale** des conversations et messages
- 🔌 **Prêt pour intégration API**

## 🚀 Installation et Lancement

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

### Étapes pour lancer le projet

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement**
   ```bash
   npm start
   # ou
   ng serve
   ```

3. **Accéder à l'application**

   Ouvrez votre navigateur et accédez à : `http://localhost:4200`

## 🔧 Configuration de l'API

Pour connecter l'application à votre API Legichat :

1. Ouvrez le fichier `src/app/core/services/chat-api.service.ts`

2. Modifiez la méthode `sendMessage()` pour correspondre à votre API :

```typescript
sendMessage(conversationId: string, message: string): Observable<Message> {
  // Remplacez cette partie par votre appel API réel
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

3. Configurez l'URL de votre API :

```typescript
// Dans app.config.ts ou un service d'initialisation
import { ChatApiService } from './core/services/chat-api.service';

// Injectez et configurez
chatApiService.setApiUrl('https://votre-api-legichat.com/api');
```

**Note** : Actuellement, l'application utilise des réponses simulées. Remplacez le code dans `sendMessage()` par vos appels API réels.

## 📁 Structure du projet

```
legichat-ui/
├── src/
│   ├── app/
│   │   ├── core/                    # Logique métier centrale
│   │   │   ├── models/              # Modèles de données
│   │   │   │   ├── conversation.model.ts
│   │   │   │   └── message.model.ts
│   │   │   ├── services/            # Services de l'application
│   │   │   │   ├── chat-api.service.ts
│   │   │   │   ├── conversation.service.ts
│   │   │   │   ├── message.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   └── interfaces/          # Contrats d'interface
│   │   │       ├── chat-api.interface.ts
│   │   │       └── storage.interface.ts
│   │   ├── features/                # Fonctionnalités principales
│   │   │   ├── chat/                # Module de chat
│   │   │   │   ├── chat.component.ts
│   │   │   │   ├── chat.component.html
│   │   │   │   └── chat.component.scss
│   │   │   └── conversation-list/   # Liste des conversations
│   │   │       ├── conversation-list.component.ts
│   │   │       ├── conversation-list.component.html
│   │   │       └── conversation-list.component.scss
│   │   ├── shared/                  # Composants partagés
│   │   │   └── components/
│   │   │       ├── message/         # Composant message
│   │   │       └── chat-input/      # Zone de saisie
│   │   ├── app.ts                   # Composant racine
│   │   ├── app.config.ts            # Configuration de l'app
│   │   └── app.routes.ts            # Routes
│   ├── styles.scss                  # Styles globaux
│   └── index.html                   # Point d'entrée HTML
├── package.json
├── angular.json
├── tsconfig.json
└── README.md
```

## 🏗️ Architecture SOLID

L'application suit les principes SOLID :

### Single Responsibility Principle (SRP)
- Chaque service a une responsabilité unique
- `ConversationService` : gère uniquement les conversations
- `MessageService` : gère uniquement les messages
- `StorageService` : gère uniquement le stockage

### Open/Closed Principle (OCP)
- Les services sont extensibles via des interfaces
- Possibilité d'ajouter de nouvelles fonctionnalités sans modifier le code existant

### Liskov Substitution Principle (LSP)
- Les implémentations peuvent être substituées par leurs interfaces
- `ChatApiService` implémente `IChatApi`

### Interface Segregation Principle (ISP)
- Interfaces spécifiques et ciblées
- `IChatApi` : contrat pour l'API de chat
- `IStorage` : contrat pour le stockage

### Dependency Inversion Principle (DIP)
- Les modules de haut niveau ne dépendent pas des modules de bas niveau
- Utilisation d'interfaces et d'injection de dépendances

## 🎯 Fonctionnalités

### Gestion des conversations
- ✅ Créer une nouvelle conversation
- ✅ Sélectionner une conversation
- ✅ Supprimer une conversation
- ✅ Aperçu du premier message
- ✅ Date de dernière modification

### Chat
- ✅ Envoyer des messages
- ✅ Recevoir des réponses (simulées ou via API)
- ✅ Affichage des messages avec avatars
- ✅ Indicateur de chargement (typing)
- ✅ Scroll automatique vers le bas
- ✅ Support Shift+Enter pour nouvelle ligne

### Persistance
- ✅ Sauvegarde automatique dans localStorage
- ✅ Restauration des conversations au chargement
- ✅ Conservation de l'historique des messages

## 📱 Design Responsive (Mobile-First)

### Desktop (> 1080px)
- Interface en plein écran occupant 100% de l'espace disponible
- Sidebar des conversations visible en permanence (280px)
- Messages en bulles avec ombres et animations au survol
- Utilisateur à droite (bulles vertes), chatbot à gauche (bulles blanches)

### Mobile & Tablette (≤ 1080px)
- Menu burger animé en haut à gauche
- Sidebar en overlay coulissant depuis la gauche
- Overlay semi-transparent pour fermer la sidebar
- Sidebar se ferme automatiquement après sélection d'une conversation
- Interface de chat plein écran
- Padding et tailles optimisés pour écrans tactiles

### Fonctionnalités du menu burger
- Bouton 48x48px avec animation de transformation (burger → X)
- Sidebar 85% de largeur (max 320px) sur mobile
- Transition fluide avec `transform: translateX()`
- Fermeture par tap sur l'overlay ou sélection de conversation
- Z-index optimisé pour superposition correcte

## 🛠️ Commandes disponibles

```bash
# Démarrer le serveur de développement
npm start
# ou
ng serve

# Compiler le projet
npm run build
# ou
ng build

# Lancer les tests
npm test
# ou
ng test
```

## 🎨 Personnalisation

### Modifier les couleurs

Les couleurs sont définies dans `src/styles.scss` via des variables CSS :

```scss
:root {
  --color-primary-green: #10b981;      // Vert principal
  --color-primary-green-dark: #059669; // Vert foncé
  --color-primary-green-light: #34d399; // Vert clair
  // ... autres variables
}
```

### Modifier le titre

Dans `src/app/features/conversation-list/conversation-list.component.html` :

```html
<h1 class="app-title">
  <span class="logo-icon">💬</span>
  Legichat <!-- Modifiez ici -->
</h1>
```

## 🔌 Intégration de l'API

### Format de requête attendu

```typescript
POST /chat
{
  "conversationId": "string",
  "message": "string"
}
```

### Format de réponse attendu

```typescript
{
  "id": "string",
  "conversationId": "string",
  "content": "string",
  "role": "assistant",
  "timestamp": "Date"
}
```

## 📦 Build de production

Pour créer un build de production optimisé :

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`.

## 🐛 Résolution des problèmes

### L'application ne démarre pas

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreurs de compilation

```bash
# Vérifier la version de Node.js
node --version  # Doit être >= 18

# Nettoyer le cache npm
npm cache clean --force
```

## 📝 Notes techniques

- **Framework** : Angular 20.3.6
- **Language** : TypeScript 5.7
- **Style** : SCSS
- **State Management** : Angular Signals
- **HTTP Client** : Angular HttpClient avec fetch API
- **Architecture** : Standalone Components
- **Persistance** : localStorage

---

**Développé avec ❤️ pour Legichat**
