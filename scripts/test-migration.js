#!/usr/bin/env node

/**
 * Script de test pour la migration vers la nouvelle API
 */

const BASE_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('🔐 Test de connexion...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'victor.binhas@gmail.com',
        password: 'Binh@s002'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Connexion réussie');
      return true;
    } else {
      console.log('❌ Échec de connexion:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return false;
  }
}

async function testUserInfo() {
  console.log('👤 Test de récupération des infos utilisateur...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth`, {
      credentials: 'include'
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Infos utilisateur récupérées:', data.user);
      return data.user;
    } else {
      console.log('❌ Échec de récupération des infos:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur de récupération des infos:', error.message);
    return null;
  }
}

async function testChatHistory() {
  console.log('💬 Test de récupération de l\'historique des chats...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat/proxy`, {
      credentials: 'include'
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Historique des chats récupéré:', data);
      return data;
    } else {
      console.log('❌ Échec de récupération de l\'historique:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur de récupération de l\'historique:', error.message);
    return null;
  }
}

async function testCreateChat(userInfo) {
  console.log('🆕 Test de création d\'un chat...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      credentials: 'include',
      body: JSON.stringify({
        title: 'Test de migration',
        messages: {
          messages: [{ content: 'Test de migration', is_user: true }],
          context: JSON.stringify({
            conversation_history: [],
            total_messages: 0,
            context_length: 0
          }),
          user_info: userInfo
        }
      })
    });

    if (response.ok) {
      console.log('✅ Chat créé avec succès');
      return true;
    } else {
      const data = await response.json();
      console.log('❌ Échec de création du chat:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de création du chat:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests de migration...\n');

  // Test 1: Connexion
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Tests arrêtés - Échec de connexion');
    return;
  }

  console.log('');

  // Test 2: Récupération des infos utilisateur
  const userInfo = await testUserInfo();
  if (!userInfo) {
    console.log('\n❌ Tests arrêtés - Impossible de récupérer les infos utilisateur');
    return;
  }

  console.log('');

  // Test 3: Historique des chats
  const chatHistory = await testChatHistory();
  if (chatHistory === null) {
    console.log('\n❌ Tests arrêtés - Impossible de récupérer l\'historique');
    return;
  }

  console.log('');

  // Test 4: Création d'un chat
  const createSuccess = await testCreateChat(userInfo);
  if (!createSuccess) {
    console.log('\n❌ Tests arrêtés - Impossible de créer un chat');
    return;
  }

  console.log('\n🎉 Tous les tests sont passés avec succès !');
}

// Exécuter les tests
runTests().catch(console.error);
