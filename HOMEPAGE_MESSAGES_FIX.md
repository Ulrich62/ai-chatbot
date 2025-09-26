# Correction Page d'Accueil - Résumé

## 🎯 Problème identifié

L'application faisait un `GET /api/chat/messages?id=73bca403-bda5-47b8-bf4b-12f3ca4f8e95` alors qu'on était sur la page d'accueil (`/`).

### Comportement incorrect observé

```
GET /api/chat/messages?id=73bca403-bda5-47b8-bf4b-12f3ca4f8e95&page=1&limit=10 200 in 513ms
```

## 🔍 Cause du problème

Le problème venait du code dans `app/(chat)/page.tsx` qui :

1. **Récupérait automatiquement l'UUID du chat le plus récent** :

   ```typescript
   const currentChatId = chats.length > 0 ? chats[0].uuid : "";
   ```

2. **Passait cet UUID à `useMessages()`** :

   ```typescript
   const { sendMessage } = useMessages(currentChatId);
   ```

3. **Déclenchait automatiquement la récupération des messages** du chat le plus récent, même sur la page d'accueil.

## 🔧 Corrections apportées

### 1. Suppression du chargement automatique de chat

**Avant:**

```typescript
// Get the most recent chat ID from the store
const currentChatId = chats.length > 0 ? chats[0].uuid : "";

const { sendMessage } = useMessages(currentChatId);
```

**Après:**

```typescript
// Sur la page d'accueil, on ne charge pas de chat existant
// On utilise useMessages sans chatId pour éviter de charger des messages
const { sendMessage } = useMessages();
```

### 2. Simplification de la logique de création de chat

**Avant:**

```typescript
const handleCreateChat = async (message: string) => {
  if (!isNewChat) {
    sendMessage({
      content: message,
      is_user: true,
    });
    return;
  }
  try {
    await createChat({ title: message });
  } catch (error) {
    console.error(error);
  }
};
```

**Après:**

```typescript
const handleCreateChat = async (message: string) => {
  // Sur la page d'accueil, on crée toujours un nouveau chat
  try {
    await createChat({ title: message });
  } catch (error) {
    console.error(error);
  }
};
```

### 3. Simplification de la logique isNewChat

**Avant:**

```typescript
const isNewChat = useMemo(() => {
  return !messages.length;
}, [messages.length]);
```

**Après:**

```typescript
// Sur la page d'accueil, on est toujours dans un nouveau chat
const isNewChat = true;
```

### 4. Suppression de l'affichage des messages existants

**Avant:**

```typescript
const {
  chatMessages: messages,
  isCreateChatPending,
  createChat,
  chats,
} = useChat();
```

**Après:**

```typescript
const { isCreateChatPending, createChat, chats } = useChat();

// Sur la page d'accueil, on est toujours dans un nouveau chat
const isNewChat = true;
const messages: any[] = []; // Pas de messages sur la page d'accueil
```

## ✅ Résultat

- ✅ **Plus de requête GET /api/chat/messages** sur la page d'accueil
- ✅ **Page d'accueil propre** sans messages existants
- ✅ **Création de nouveaux chats** fonctionne correctement
- ✅ **Navigation vers les chats existants** via la sidebar fonctionne
- ✅ **Performance améliorée** (moins de requêtes inutiles)

## 📝 Comportement attendu

### Page d'accueil (`/`)

- Affiche l'interface de création de nouveau chat
- Ne charge aucun message existant
- Permet de créer un nouveau chat en tapant un message
- Redirige vers `/chat/{uuid}` après création

### Page de chat (`/chat/{uuid}`)

- Charge les messages du chat spécifique
- Permet d'envoyer de nouveaux messages
- Affiche l'historique de la conversation

## 🎯 Impact

- **UX améliorée** : Page d'accueil claire et focalisée
- **Performance optimisée** : Moins de requêtes inutiles
- **Logique simplifiée** : Comportement prévisible
- **Séparation claire** : Page d'accueil vs page de chat
