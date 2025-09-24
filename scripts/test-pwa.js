#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration PWA
 * Usage: node scripts/test-pwa.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Test de la configuration PWA...\n');

// Vérifier le manifest.json
const manifestPath = path.join(__dirname, '../public/manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('✅ Manifest.json trouvé');
  console.log(`   - Nom: ${manifest.name}`);
  console.log(`   - Short name: ${manifest.short_name}`);
  console.log(`   - Display: ${manifest.display}`);
  console.log(`   - Start URL: ${manifest.start_url}`);
  console.log(`   - Icons: ${manifest.icons?.length || 0} icônes`);
  console.log(`   - Scope: ${manifest.scope || 'non défini'}`);
  
  // Vérifications importantes
  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
  const missingFields = requiredFields.filter(field => !manifest[field]);
  
  if (missingFields.length > 0) {
    console.log(`❌ Champs manquants dans le manifest: ${missingFields.join(', ')}`);
  } else {
    console.log('✅ Tous les champs requis sont présents');
  }
  
  // Vérifier les icônes
  if (manifest.icons && manifest.icons.length > 0) {
    const hasMaskable = manifest.icons.some(icon => icon.purpose === 'maskable');
    const hasAny = manifest.icons.some(icon => icon.purpose === 'any');
    
    console.log(`   - Icônes maskable: ${hasMaskable ? '✅' : '❌'}`);
    console.log(`   - Icônes any: ${hasAny ? '✅' : '❌'}`);
  }
} else {
  console.log('❌ Manifest.json non trouvé');
}

// Vérifier le service worker
const swPath = path.join(__dirname, '../public/sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service Worker trouvé');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  if (swContent.includes('serwist')) {
    console.log('✅ Service Worker utilise Serwist');
  } else {
    console.log('⚠️  Service Worker ne semble pas utiliser Serwist');
  }
} else {
  console.log('❌ Service Worker non trouvé');
}

// Vérifier les icônes
const iconSizes = ['192x192', '512x512', '96x96'];
const iconsPath = path.join(__dirname, '../public/images');

iconSizes.forEach(size => {
  const iconPath = path.join(iconsPath, `icon-${size}.png`);
  if (fs.existsSync(iconPath)) {
    console.log(`✅ Icône ${size} trouvée`);
  } else {
    console.log(`❌ Icône ${size} manquante`);
  }
});

console.log('\n📱 Instructions pour tester sur mobile:');
console.log('1. Déployez l\'application en production');
console.log('2. Ouvrez l\'URL sur votre appareil mobile');
console.log('3. Pour iOS: Utilisez Safari et cherchez "Ajouter à l\'écran d\'accueil"');
console.log('4. Pour Android: Utilisez Chrome et cherchez l\'icône d\'installation');
console.log('\n🔧 En mode développement, la bannière d\'installation s\'affiche automatiquement pour les tests.');
console.log('\n🔄 Gestion de la désinstallation:');
console.log('- Si l\'utilisateur désinstalle l\'app, la bannière réapparaîtra après 24h');
console.log('- L\'état est automatiquement réinitialisé lors du retour sur le site');
console.log('- En mode debug, utilisez le bouton RESET pour tester la réinitialisation');
