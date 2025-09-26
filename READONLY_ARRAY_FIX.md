# Correction ReadOnly Array - Résumé

## 🎯 Problème identifié

Erreur lors de l'envoi de messages :

```
Cannot assign to read only property '0' of object '[object Array]'
```

## 🔍 Cause du problème

L'erreur se produisait dans `hooks/use-messages.ts` à la ligne 66, où le code tentait de modifier directement un tableau en lecture seule :

```typescript
// ❌ PROBLÉMATIQUE - Modifie directement le tableau
const sortedStoreMessages = chatMessages.sort((a, b) => {
  // ...
});
```

Le tableau `chatMessages` provenant du store Zustand était en lecture seule, et l'opération `.sort()` modifie directement le tableau original.

## 🔧 Correction apportée

**Avant:**

```typescript
// D'abord, trier les messages de l'API
const sortedApiMessages = (messages ?? []).sort((a, b) => {
  // ...
});

// Ensuite, trier les messages du store
const sortedStoreMessages = chatMessages.sort((a, b) => {
  // ...
});
```

**Après:**

```typescript
// D'abord, trier les messages de l'API
const sortedApiMessages = [...(messages ?? [])].sort((a, b) => {
  // ...
});

// Ensuite, trier les messages du store
const sortedStoreMessages = [...chatMessages].sort((a, b) => {
  // ...
});
```

## ✅ Résultat

- ✅ L'envoi de messages fonctionne maintenant correctement
- ✅ Plus d'erreur "Cannot assign to read only property"
- ✅ Les messages sont correctement triés par date
- ✅ L'application est stable

## 📝 Leçon apprise

**Toujours créer une copie des tableaux avant de les modifier :**

```typescript
// ❌ Éviter - Modifie le tableau original
array.sort()

// ✅ Correct - Crée une copie avant de trier
[...array].sort()
```

Cette pratique est particulièrement importante avec :

- Les tableaux provenant de stores d'état (Zustand, Redux)
- Les tableaux provenant de React Query
- Les tableaux provenant de props React
- Tout tableau qui pourrait être en lecture seule
