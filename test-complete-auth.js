/**
 * Test Office SSO Direct - Format Backend
 */

const crypto = require('crypto');

// Configuration pour test direct avec Office
const OFFICE_BASE_URL = "https://office-test.bgds.fr";
const HTTP_SIGNATURE_SECRET = "16Y2EtjgwfGddP7stzjmGKEfLmeh9tfgVbX5Bx8f4K6QnprnTzv86xm4mLounHk";

class DirectOfficeSSOTest {
  constructor() {
    this.authToken = null;
    this.sessionId = null;
  }

  generateSessionId() {
    return 'test_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  createSignature(method, url, sessionId, secret, keyId = "ia-assistant", created = null) {
    if (created === null) {
      created = Math.floor(Date.now() / 1000);
    }

    const urlObj = new URL(url);
    const requestTarget = `${method.toLowerCase()} ${urlObj.pathname}`;
    
    console.log(`   🔍 Debug signature:`);
    console.log(`   - RequestTarget: "${requestTarget}"`);
    console.log(`   - Created: ${created}`);
    
    // Format Backend simplifié: juste les valeurs brutes séparées par newline
    const signingString = `${requestTarget}\n${created}`;
    console.log(`   - SigningString:\n"${signingString}"`);
    
    const signature = crypto.createHmac('sha256', secret).update(signingString).digest('base64');
    console.log(`   - Signature: ${signature}`);
    
    // Header Authorization au format Draft Cavage (mais signature simplifiée)
    const authorization = `Signature keyId="${keyId}",algorithm="hmac-sha256",created=${created},headers="(request-target) (created)",signature="${signature}"`;
    
    return {
      'Authorization': authorization,
      'Content-Type': 'application/json'
    };
  }

  async runTest() {
    console.log('🚀 Test Office SSO Direct - Format Backend');
    console.log(`📍 Test direct avec Office: ${OFFICE_BASE_URL}`);
    console.log('='.repeat(50));
    
    const startTime = Date.now();
    
    try {
      // Étape 1: Login avec credentials directement avec Office
      console.log('\n🔍 Étape 1: Login avec credentials (Office)...');
      const loginStartTime = Date.now();
      
      const loginResponse = await fetch(`${OFFICE_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'info@denemlabs.com',
          pass: '7LbS@TJz@5fYH4Q',
          app: 'ia-assistant',
          type: 'auth_token'
        })
      });
      
      const loginTime = Date.now() - loginStartTime;
      
      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status}`);
      }
      
      const loginData = await loginResponse.json();
      this.authToken = loginData.auth_token;
      console.log(`✅ Login réussi en ${loginTime}ms`);
      console.log(`🔑 Token généré: ${this.authToken.substring(0, 20)}...`);
      
      // Étape 2: Test avec Office (format backend)
      console.log('\n🔍 Étape 2: Test avec Office (Format Backend Simplifié)...');
      const validationStartTime = Date.now();
      
      this.sessionId = this.generateSessionId();
      const officeUrl = `${OFFICE_BASE_URL}/api/checkAuthToken?auth_token=${this.authToken}&session_id=${this.sessionId}`;
      
      const signatureHeaders = this.createSignature('GET', officeUrl, this.sessionId, HTTP_SIGNATURE_SECRET);
      
      const officeResponse = await fetch(officeUrl, {
        method: 'GET',
        headers: signatureHeaders
      });
      
      const validationTime = Date.now() - validationStartTime;
      const totalTime = Date.now() - startTime;
      
      console.log(`   Status Office: ${officeResponse.status}`);
      console.log(`   Temps de validation: ${validationTime}ms`);
      console.log(`   Temps total: ${totalTime}ms`);
      
      if (officeResponse.ok) {
        const officeData = await officeResponse.json();
        console.log(`   ✅ SUCCÈS Office! Réponse:`, officeData);
        
        console.log('\n🎉 Office SSO fonctionne parfaitement !');
        console.log('✅ Login avec credentials (Office)');
        console.log('✅ Signature HTTP format backend');
        console.log('✅ Validation Office directe');
        console.log('✅ Le système est maintenant 100% opérationnel !');
        
        return true;
      } else {
        const errorData = await officeResponse.text();
        console.log(`   ❌ Échec Office: ${errorData}`);
        
        console.log('\n🔍 Comparez les signatures calculées ci-dessus avec les logs backend');
        
        return false;
      }
      
    } catch (error) {
      console.log(`❌ Erreur durant le test: ${error.message}`);
      return false;
    }
  }
}

// Exécution du test direct
const tester = new DirectOfficeSSOTest();
tester.runTest().catch(console.error);