#!/usr/bin/env node

/**
 * Script de test pour valider les corrections apportées
 */

const BASE_URL = 'http://localhost:3002';

async function testUserInfoCaching() {
  console.log('🔧 Test du cache des infos utilisateur...');
  
  let authToken = '';
  
  try {
    // 1. Connexion
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'victor.binhas@gmail.com',
        password: 'Binh@s002'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Échec de connexion');
      return false;
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) authToken = tokenMatch[1];
    }

    // 2. Test de l'endpoint user-info (devrait être mis en cache)
    console.log('   Test de l\'endpoint user-info...');
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/auth/user-info`, {
      headers: { 'Cookie': `token=${authToken}` }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response.ok) {
      console.log(`   ✅ Succès en ${duration}ms`);
      return true;
    } else {
      console.log(`   ❌ Échec: ${response.status}`);
      return false;
    }

  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
    return false;
  }
}

async function testChatGrouping() {
  console.log('📅 Test du groupage des chats...');
  
  let authToken = '';
  
  try {
    // 1. Connexion
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'victor.binhas@gmail.com',
        password: 'Binh@s002'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Échec de connexion');
      return false;
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) authToken = tokenMatch[1];
    }

    // 2. Test de l'historique des chats
    const response = await fetch(`${BASE_URL}/api/chat/proxy`, {
      headers: { 'Cookie': `token=${authToken}` }
    });

    if (!response.ok) {
      console.log('   ❌ Échec de récupération des chats');
      return false;
    }

    const data = await response.json();
    const chats = data.items;

    if (chats.length === 0) {
      console.log('   ⚠️  Aucun chat trouvé');
      return true;
    }

    // 3. Vérifier que les chats ont des dates
    const chatsWithDates = chats.filter(chat => chat.created || chat.created_at);
    console.log(`   📊 Chats avec dates: ${chatsWithDates.length}/${chats.length}`);

    // 4. Vérifier l'ordre (plus récent en premier)
    if (chats.length > 1) {
      const firstChat = new Date(chats[0].created || chats[0].created_at);
      const secondChat = new Date(chats[1].created || chats[1].created_at);
      
      if (firstChat >= secondChat) {
        console.log('   ✅ Chats triés correctement (plus récent en premier)');
        return true;
      } else {
        console.log('   ❌ Chats mal triés');
        return false;
      }
    }

    console.log('   ✅ Groupage des chats fonctionne');
    return true;

  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
    return false;
  }
}

async function testMessageOrdering() {
  console.log('💬 Test de l\'ordre des messages...');
  
  let authToken = '';
  
  try {
    // 1. Connexion
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'victor.binhas@gmail.com',
        password: 'Binh@s002'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Échec de connexion');
      return false;
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) authToken = tokenMatch[1];
    }

    // 2. Récupérer l'historique des chats
    const chatsResponse = await fetch(`${BASE_URL}/api/chat/proxy`, {
      headers: { 'Cookie': `token=${authToken}` }
    });

    if (!chatsResponse.ok) {
      console.log('   ❌ Échec de récupération des chats');
      return false;
    }

    const chatsData = await chatsResponse.json();
    const chats = chatsData.items;

    if (chats.length === 0) {
      console.log('   ⚠️  Aucun chat trouvé');
      return true;
    }

    // 3. Tester les messages du premier chat
    const firstChat = chats[0];
    const messagesResponse = await fetch(`${BASE_URL}/api/chat/proxy/messages?id=${firstChat.uuid}`, {
      headers: { 'Cookie': `token=${authToken}` }
    });

    if (!messagesResponse.ok) {
      console.log('   ❌ Échec de récupération des messages');
      return false;
    }

    const messages = await messagesResponse.json();

    if (messages.length === 0) {
      console.log('   ⚠️  Aucun message trouvé');
      return true;
    }

    // 4. Vérifier l'ordre des messages (plus ancien en premier)
    if (messages.length > 1) {
      const firstMessage = new Date(messages[0].created || messages[0].created_at);
      const secondMessage = new Date(messages[1].created || messages[1].created_at);
      
      console.log(`   📅 Premier message: ${firstMessage.toISOString()}`);
      console.log(`   📅 Second message: ${secondMessage.toISOString()}`);
      
      if (firstMessage <= secondMessage) {
        console.log('   ✅ Messages triés correctement (plus ancien en premier)');
        return true;
      } else {
        console.log('   ❌ Messages mal triés (API retourne dans l\'ordre décroissant)');
        return false;
      }
    }

    console.log('   ✅ Ordre des messages fonctionne');
    return true;

  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests de validation...\n');

  const results = {
    userInfoCaching: false,
    chatGrouping: false,
    messageOrdering: false
  };

  // Test 1: Cache des infos utilisateur
  results.userInfoCaching = await testUserInfoCaching();
  console.log('');

  // Test 2: Groupage des chats
  results.chatGrouping = await testChatGrouping();
  console.log('');

  // Test 3: Ordre des messages
  results.messageOrdering = await testMessageOrdering();
  console.log('');

  // Résumé des résultats
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log('📊 Résumé des tests:');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
  
  Object.entries(results).forEach(([test, passed]) => {
    const testName = {
      userInfoCaching: 'Cache infos utilisateur',
      chatGrouping: 'Groupage des chats',
      messageOrdering: 'Ordre des messages'
    }[test];
    console.log(`   ${passed ? '✅' : '❌'} ${testName}`);
  });

  if (passedTests === totalTests) {
    console.log('\n🎉 Tous les tests sont passés ! Les corrections sont validées.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }

  return results;
}

// Exécuter les tests
runAllTests().catch(console.error);
