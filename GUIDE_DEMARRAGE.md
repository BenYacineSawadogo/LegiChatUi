# 🚀 Guide de Démarrage Rapide - Legichat UI

Ce guide vous permettra de lancer l'application Legichat en quelques minutes.

## ⚡ Installation Express

### 1. Extraire le projet (si vous utilisez le ZIP)

```bash
unzip legichat-ui.zip
cd legichat-ui
```

### 2. Installer les dépendances

```bash
npm install
```

**Temps d'installation** : ~2-3 minutes

### 3. Lancer l'application

```bash
npm start
```

**L'application sera accessible sur** : http://localhost:4200

## 🎯 Première utilisation

### Créer une conversation

1. Cliquez sur le bouton **"Nouveau chat"** en haut de la barre latérale
2. Une nouvelle conversation sera créée et automatiquement sélectionnée

### Envoyer un message

1. Tapez votre message dans la zone de saisie en bas
2. Appuyez sur **Entrée** ou cliquez sur le bouton d'envoi
3. Pour une nouvelle ligne, utilisez **Shift+Entrée**

### Gérer les conversations

- **Sélectionner** : Cliquez sur une conversation dans la liste
- **Supprimer** : Survolez une conversation et cliquez sur l'icône poubelle
- Les conversations sont **sauvegardées automatiquement** dans votre navigateur

## 🔌 Connecter votre API

### Configuration rapide

1. Ouvrez `src/app/core/services/chat-api.service.ts`

2. Modifiez la méthode `sendMessage` :

```typescript
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

3. Configurez l'URL de votre API :

```typescript
// Dans le constructeur ou via un service d'initialisation
this.apiUrl = 'https://votre-api.com/api';
```

### Format de l'API attendu

**Requête POST /chat**
```json
{
  "conversationId": "conv-123",
  "message": "Bonjour"
}
```

**Réponse**
```json
{
  "id": "msg-456",
  "conversationId": "conv-123",
  "content": "Bonjour ! Comment puis-je vous aider ?",
  "role": "assistant",
  "timestamp": "2025-10-20T21:00:00Z"
}
```

## 🎨 Personnalisation rapide

### Changer le titre

Fichier : `src/app/features/conversation-list/conversation-list.component.html`

```html
<h1 class="app-title">
  <span class="logo-icon">💬</span>
  Legichat <!-- Changez ici -->
</h1>
```

### Changer les couleurs

Fichier : `src/styles.scss`

```scss
:root {
  --color-primary-green: #10b981;      /* Couleur principale */
  --color-primary-green-dark: #059669; /* Couleur hover/active */
}
```

## 📦 Build pour production

```bash
npm run build
```

Les fichiers seront dans `dist/legichat-ui/`

## ❓ Problèmes courants

### Port 4200 déjà utilisé

```bash
ng serve --port 4201
```

### Erreur d'installation

```bash
rm -rf node_modules package-lock.json
npm install
```

### L'application ne charge pas

1. Vérifiez la console du navigateur (F12)
2. Vérifiez que Node.js version >= 18
3. Essayez de vider le cache du navigateur

## 📞 Commandes utiles

```bash
# Démarrer l'application
npm start

# Compiler pour production
npm run build

# Lancer les tests
npm test

# Nettoyer et réinstaller
rm -rf node_modules && npm install
```

## ✨ Fonctionnalités principales

- ✅ Conversations multiples
- ✅ Sauvegarde automatique
- ✅ Interface responsive
- ✅ Indicateur de chargement
- ✅ Scroll automatique
- ✅ Support clavier (Enter, Shift+Enter)

## 📁 Structure des fichiers importants

```
src/app/
├── core/
│   ├── models/          # Modèles de données
│   ├── services/        # Logique métier
│   └── interfaces/      # Contrats
├── features/
│   ├── chat/           # Interface de chat
│   └── conversation-list/  # Liste conversations
└── shared/
    └── components/     # Composants réutilisables
```

## 🎓 Prochaines étapes

1. **Testez l'interface** : Créez quelques conversations, envoyez des messages
2. **Intégrez votre API** : Modifiez `chat-api.service.ts`
3. **Personnalisez** : Ajustez les couleurs et le style
4. **Déployez** : Créez un build de production

## 🆘 Besoin d'aide ?

1. Consultez le `README.md` complet
2. Vérifiez les commentaires dans le code (JSDoc)
3. Examinez les exemples dans chaque service

---

**Bon développement ! 🚀**
