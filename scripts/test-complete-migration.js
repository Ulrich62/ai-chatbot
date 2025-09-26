#!/usr/bin/env node

/**
 * Script de test complet pour la migration vers la nouvelle API
 */

const BASE_URL = 'http://localhost:3000';

let authToken = '';
let refreshToken = '';
let chatId = '';

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
      // Extraire les tokens des cookies
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
        const refreshMatch = setCookieHeader.match(/refreshToken=([^;]+)/);
        if (tokenMatch) authToken = tokenMatch[1];
        if (refreshMatch) refreshToken = refreshMatch[1];
      }
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
      headers: {
        'Cookie': `token=${authToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Infos utilisateur récupérées:', data.user.email);
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
      headers: {
        'Cookie': `token=${authToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Historique des chats récupéré:', data.items.length, 'chats');
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
        'Cookie': `token=${authToken}`
      },
      body: JSON.stringify({
        title: 'Test de migration complet',
        messages: {
          messages: [{ content: 'Test de migration complet', is_user: true }],
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
      const text = await response.text();
      const chatCreatedMatch = text.match(/chat_id":\s*"([^"]+)"/);
      if (chatCreatedMatch) {
        chatId = chatCreatedMatch[1];
        console.log('✅ Chat créé avec succès, ID:', chatId);
        return true;
      } else {
        console.log('❌ Impossible d\'extraire l\'ID du chat');
        return false;
      }
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

async function testSendMessage(userInfo) {
  console.log('📤 Test d\'envoi d\'un message...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat/proxy/messages?id=${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cookie': `token=${authToken}`
      },
      body: JSON.stringify({
        messages: [{ content: 'Comment fonctionne la nouvelle API ?', is_user: true }],
        context: JSON.stringify({
          conversation_history: [
            {
              content: 'Test de migration complet',
              is_user: true,
              timestamp: new Date().toISOString(),
              uuid: 'test-uuid-1'
            }
          ],
          total_messages: 1,
          context_length: 1
        }),
        user_info: userInfo
      })
    });

    if (response.ok) {
      const text = await response.text();
      console.log('✅ Message envoyé avec succès');
      return true;
    } else {
      const data = await response.json();
      console.log('❌ Échec d\'envoi du message:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur d\'envoi du message:', error.message);
    return false;
  }
}

async function testGetMessages() {
  console.log('📥 Test de récupération des messages...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat/proxy/messages?id=${chatId}`, {
      headers: {
        'Cookie': `token=${authToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Messages récupérés:', data.length, 'messages');
      return data;
    } else {
      console.log('❌ Échec de récupération des messages:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur de récupération des messages:', error.message);
    return null;
  }
}

async function testRefreshToken() {
  console.log('🔄 Test de refresh token...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': `refreshToken=${refreshToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Refresh token réussi');
      return true;
    } else {
      console.log('❌ Échec du refresh token:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur du refresh token:', error.message);
    return false;
  }
}

async function runCompleteTests() {
  console.log('🚀 Démarrage des tests complets de migration...\n');

  const results = {
    login: false,
    userInfo: false,
    chatHistory: false,
    createChat: false,
    sendMessage: false,
    getMessages: false,
    refreshToken: false
  };

  // Test 1: Connexion
  results.login = await testLogin();
  if (!results.login) {
    console.log('\n❌ Tests arrêtés - Échec de connexion');
    return results;
  }
  console.log('');

  // Test 2: Récupération des infos utilisateur
  const userInfo = await testUserInfo();
  results.userInfo = !!userInfo;
  if (!userInfo) {
    console.log('\n❌ Tests arrêtés - Impossible de récupérer les infos utilisateur');
    return results;
  }
  console.log('');

  // Test 3: Historique des chats
  const chatHistory = await testChatHistory();
  results.chatHistory = chatHistory !== null;
  if (chatHistory === null) {
    console.log('\n❌ Tests arrêtés - Impossible de récupérer l\'historique');
    return results;
  }
  console.log('');

  // Test 4: Création d'un chat
  results.createChat = await testCreateChat(userInfo);
  if (!results.createChat) {
    console.log('\n❌ Tests arrêtés - Impossible de créer un chat');
    return results;
  }
  console.log('');

  // Test 5: Envoi d'un message
  results.sendMessage = await testSendMessage(userInfo);
  if (!results.sendMessage) {
    console.log('\n❌ Tests arrêtés - Impossible d\'envoyer un message');
    return results;
  }
  console.log('');

  // Test 6: Récupération des messages
  const messages = await testGetMessages();
  results.getMessages = messages !== null;
  if (messages === null) {
    console.log('\n❌ Tests arrêtés - Impossible de récupérer les messages');
    return results;
  }
  console.log('');

  // Test 7: Refresh token
  results.refreshToken = await testRefreshToken();
  console.log('');

  // Résumé des résultats
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log('📊 Résumé des tests:');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${test}`);
  });

  if (passedTests === totalTests) {
    console.log('\n🎉 Tous les tests sont passés avec succès ! La migration est complète.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }

  return results;
}

// Exécuter les tests
runCompleteTests().catch(console.error);
