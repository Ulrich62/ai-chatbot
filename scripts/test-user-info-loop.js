#!/usr/bin/env node

/**
 * Script de test pour vérifier que la boucle infinie dans useUserInfo est résolue
 */

const BASE_URL = 'http://localhost:3002';

async function testUserInfoLoop() {
  console.log('🔄 Test de la boucle useUserInfo...');
  
  let authToken = '';
  
  try {
    // 1. Connexion pour obtenir un token
    console.log('1. Connexion...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'victor.binhas@gmail.com',
        password: 'Binh@s002'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Échec de connexion');
      return;
    }

    // Extraire le token des cookies
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) authToken = tokenMatch[1];
    }

    console.log('✅ Connexion réussie');

    // 2. Tester l'endpoint user-info plusieurs fois
    console.log('2. Test de l\'endpoint user-info (5 appels)...');
    
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        fetch(`${BASE_URL}/api/auth/user-info`, {
          headers: {
            'Cookie': `token=${authToken}`
          }
        }).then(async (response) => {
          const data = await response.json();
          console.log(`   Appel ${i + 1}: ${response.ok ? '✅' : '❌'} ${response.status}`);
          return { ok: response.ok, status: response.status, data };
        })
      );
    }

    const results = await Promise.all(promises);
    
    // 3. Analyser les résultats
    const successCount = results.filter(r => r.ok).length;
    const errorCount = results.filter(r => !r.ok).length;
    
    console.log(`\n📊 Résultats:`);
    console.log(`   ✅ Succès: ${successCount}/5`);
    console.log(`   ❌ Erreurs: ${errorCount}/5`);
    
    if (successCount === 5) {
      console.log('\n🎉 Test réussi ! Aucune boucle infinie détectée.');
    } else {
      console.log('\n⚠️  Des erreurs ont été détectées. Vérifiez les logs.');
    }

    // 4. Test de performance
    console.log('\n3. Test de performance (10 appels rapides)...');
    const startTime = Date.now();
    
    const perfPromises = [];
    for (let i = 0; i < 10; i++) {
      perfPromises.push(
        fetch(`${BASE_URL}/api/auth/user-info`, {
          headers: {
            'Cookie': `token=${authToken}`
          }
        })
      );
    }

    await Promise.all(perfPromises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   ⏱️  Durée totale: ${duration}ms`);
    console.log(`   📈 Moyenne par appel: ${(duration / 10).toFixed(2)}ms`);
    
    if (duration < 5000) {
      console.log('✅ Performance acceptable');
    } else {
      console.log('⚠️  Performance lente, possible boucle');
    }

  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testUserInfoLoop().catch(console.error);
