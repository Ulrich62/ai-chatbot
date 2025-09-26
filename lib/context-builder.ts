import type { Message, NewMessage } from '@/types';

/**
 * Construit le contexte de conversation à partir des 10 derniers messages
 * @param messages - Liste des messages de la conversation
 * @param newMessage - Le nouveau message à ajouter
 * @returns JSON string représentant le contexte
 */
export function buildConversationContext(messages: Message[], newMessage?: NewMessage): string {
  // Créer une liste temporaire avec le nouveau message
  const allMessages = newMessage ? [...messages, newMessage as Message] : messages;
  
  // Prendre les 10 derniers messages
  const recentMessages = allMessages.slice(-10);
  
  // Construire le contexte
  const context = {
    conversation_history: recentMessages.map(msg => ({
      content: msg.content,
      is_user: msg.is_user,
      timestamp: msg.created || new Date().toISOString(),
      ...(msg.uuid && { uuid: msg.uuid })
    })),
    total_messages: allMessages.length,
    context_length: recentMessages.length
  };
  
  return JSON.stringify(context);
}

/**
 * Construit les informations utilisateur pour l'API
 * @param user - Données utilisateur
 * @returns Objet formaté pour l'API
 */
export function buildUserInfo(user: any) {
  return {
    uuid: user.uuid,
    email: user.email,
    name: user.name,
    fname: user.fname,
    label: user.label,
    id: user.id,
    role: user.role,
    specialities: user.specialities || [],
    companies: user.companies || []
  };
}
